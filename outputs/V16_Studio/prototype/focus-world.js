import * as CANNON from 'cannon-es';
export const PHYSICS_STEP = 1 / 180;
const vec = (a) => new CANNON.Vec3(...a);
export function createFocusWorld(parts, scale) {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0),
    allowSleep: false,
  });
  world.solver.iterations = 40;
  world.solver.tolerance = 1e-8;
  Object.assign(world.defaultContactMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1e7,
    contactEquationRelaxation: 4,
  });
  const bodies = parts.map((p, i) => {
    const body = new CANNON.Body({
      mass: i === 0 ? 0 : i === 8 ? 0.028 : 0.004,
      position: vec(p.position),
      linearDamping: 0.24,
      angularDamping: 0.42,
    });
    if (i === 8) {
      body.addShape(
        new CANNON.Box(
          new CANNON.Vec3(
            p.size[0] * 0.43,
            p.size[1] * 0.4,
            Math.max(p.size[2] * 0.36, 0.04),
          ),
        ),
        new CANNON.Vec3(0, -p.size[1] * 0.07, 0),
      );
    } else {
      // Wire colliders leave the hole open, unlike a convex hull.
      const count = i === 0 ? 48 : 20,
        tube = (i === 0 ? 0.00055 : 0.0004) * scale,
        axis = p.size[0] > p.size[2] ? 0 : 2,
        ry = p.size[1] / 2 - tube,
        rx = p.size[axis] / 2 - tube;
      for (let k = 0; k < count; k++) {
        const t = (k / count) * Math.PI * 2,
          c = [0, ry * Math.sin(t), 0];
        c[axis] = rx * Math.cos(t);
        body.addShape(new CANNON.Sphere(tube), vec(c));
      }
    }
    world.addBody(body);
    return body;
  });
  const joints = [];
  for (let i = 0; i < 8; i++) {
    const a = parts[i],
      b = parts[i + 1];
    let point;
    if (i === 0)
      point = [b.position[0], (a.min[1] + b.max[1]) / 2, b.position[2]];
    else if (i === 7)
      point = [a.position[0], a.position[1] - 0.0018 * scale, a.position[2]];
    else point = a.position.map((v, j) => (v + b.position[j]) / 2);
    const joint = new CANNON.PointToPointConstraint(
      bodies[i],
      vec(point).vsub(bodies[i].position),
      bodies[i + 1],
      vec(point).vsub(bodies[i + 1].position),
      1e5,
    );
    joint.collideConnected = false;
    joint.equations.forEach((eq) => eq.setSpookParams(1e9, 4, PHYSICS_STEP));
    world.addConstraint(joint);
    joints.push(joint);
  }
  const floor = new CANNON.Body({ mass: 0 });
  floor.addShape(new CANNON.Plane());
  floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  floor.position.y = -2.63;
  world.addBody(floor);
  const hand = new CANNON.Body({
    mass: 0,
    collisionFilterGroup: 0,
    collisionFilterMask: 0,
  });
  world.addBody(hand);
  let grabJoint = null;
  const handTarget = new CANNON.Vec3();
  const handVelocity = new CANNON.Vec3();
  const topJoint = bodies[0].pointToWorldFrame(joints[0].pivotA);
  let reach = 3;
  let lastPush = -Infinity;
  function limitVelocity(v, max) {
    const speed = v.length();
    if (speed > max) v.scale(max / speed, v);
  }
  world.addEventListener('preStep', () => {
    bodies.slice(1).forEach((b, i) => {
      limitVelocity(b.velocity, 3.2);
      limitVelocity(b.angularVelocity, i === 7 ? 4 : 9);
    });
    if (grabJoint) {
      const delta = handTarget.vsub(hand.position),
        length = delta.length();
      if (length > 0.00001) {
        delta.scale(10, delta);
        limitVelocity(delta, 2.2);
        const acceleration = delta.vsub(handVelocity);
        limitVelocity(acceleration, 16 * PHYSICS_STEP);
        handVelocity.vadd(acceleration, handVelocity);
        const step = handVelocity.scale(PHYSICS_STEP);
        if (step.length() > length) step.copy(handTarget.vsub(hand.position));
        hand.position.vadd(step, hand.position);
      }
    }
  });
  function release() {
    if (grabJoint) world.removeConstraint(grabJoint);
    grabJoint = null;
    handVelocity.setZero();
  }
  function grab(point) {
    release();
    hand.position.copy(vec(point));
    handTarget.copy(hand.position);
    const attachment=bodies[8].pointToWorldFrame(joints[7].pivotB);
    reach=vec(point).distanceTo(attachment);
    for(let i=1;i<8;i++) reach+=joints[i-1].pivotB.distanceTo(joints[i].pivotA);
    const body = bodies[8],
      pivot = body.pointToLocalFrame(vec(point));
    grabJoint = new CANNON.PointToPointConstraint(
      hand,
      new CANNON.Vec3(),
      body,
      pivot,
      0.7,
    );
    grabJoint.collideConnected = false;
    grabJoint.equations.forEach((eq) => eq.setSpookParams(2e4, 6, PHYSICS_STEP));
    world.addConstraint(grabJoint);
  }
  function move(point) {
    const target=vec(point);
    target.x=Math.max(-1.4,Math.min(1.4,target.x));
    target.y=Math.max(-2.15,Math.min(topJoint.y-0.45,target.y));
    target.z=Math.max(-0.45,Math.min(0.45,target.z));
    const offset=target.vsub(topJoint);
    if(offset.length()>reach)offset.scale(reach/offset.length(),offset);
    topJoint.vadd(offset,handTarget);
  }
  function reset() {
    release();
    bodies.forEach((b, i) => {
      b.position.copy(vec(parts[i].position));
      b.previousPosition.copy(b.position);
      b.interpolatedPosition.copy(b.position);
      b.initPosition.copy(b.position);
      b.quaternion.set(0, 0, 0, 1);
      b.previousQuaternion.copy(b.quaternion);
      b.interpolatedQuaternion.copy(b.quaternion);
      b.velocity.setZero();
      b.angularVelocity.setZero();
      b.force.setZero();
      b.torque.setZero();
      b.aabbNeedsUpdate = true;
      b.wakeUp();
    });
    world.time = 0;
    world.accumulator = 0;
    lastPush=-Infinity;
  }
  function push(direction = 1) {
    if(world.time-lastPush<0.35)return;
    lastPush=world.time;
    bodies[8].applyImpulse(
      new CANNON.Vec3(0.024 * direction, 0, 0.007),
      new CANNON.Vec3(0, 0.4, 0),
    );
  }
  function maxJointError() {
    return Math.max(
      ...joints.map((j) =>
        j.bodyA
          .pointToWorldFrame(j.pivotA)
          .distanceTo(j.bodyB.pointToWorldFrame(j.pivotB)),
      ),
    );
  }
  return {
    world,
    bodies,
    joints,
    grab,
    move,
    release,
    reset,
    push,
    maxJointError,
  };
}
