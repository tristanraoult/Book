import * as THREE from 'three';
export function prepareFocus(root) {
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root),
    scale = 4.8 / bounds.getSize(new THREE.Vector3()).y,
    center = bounds.getCenter(new THREE.Vector3());
  const normalize = new THREE.Matrix4()
    .makeScale(scale, scale, scale)
    .multiply(
      new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z),
    );
  const parts = root.children
    .filter((n) => n.name.startsWith('focus_'))
    .map((node) => {
      const group = new THREE.Group();
      group.name = node.name;
      node.traverse((child) => {
        if (child.isMesh) {
          const geo = child.geometry.clone();
          geo.applyMatrix4(normalize.clone().multiply(child.matrixWorld));
          const mesh = new THREE.Mesh(geo, child.material);
          mesh.castShadow = true;
          mesh.receiveShadow = false;
          group.add(mesh);
        }
      });
      const box = new THREE.Box3().setFromObject(group),
        position = box.getCenter(new THREE.Vector3());
      group.children.forEach((m) =>
        m.geometry.translate(-position.x, -position.y, -position.z),
      );
      group.position.copy(position);
      return {
        name: node.name,
        group,
        position: position.toArray(),
        size: box.getSize(new THREE.Vector3()).toArray(),
        min: box.min.toArray(),
        max: box.max.toArray(),
      };
    });
  const ring = parts.find((p) => p.name === 'focus_ring'),
    pendant = parts.find((p) => p.name === 'focus_pendant'),
    links = parts
      .filter((p) => p.name.startsWith('focus_link_'))
      .sort((a, b) => b.position[1] - a.position[1]);
  if (!ring || !pendant || links.length !== 7)
    throw new Error('Le modèle ne contient pas les neuf pièces attendues.');
  return { parts: [ring, ...links, pendant], scale };
}
