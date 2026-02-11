// Utility to format values (primitives, arrays, objects) into readable strings
export default function formatValue(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) {
    return v
      .map(item => (typeof item === 'object' && item !== null ? formatValue(item) : String(item)))
      .filter(x => x)
      .join(', ');
  }
  if (typeof v === "object") {
    // Prefer common "name"-like properties when rendering objects
    const preferred = ['projectName','project','name','title','label','roleName','departmentName','designationName','statusName','userName','locationName'];
    for (const p of preferred) {
      if (v[p]) return String(v[p]);
    }
    // If object has an id and a display-like property, try to build a short string
    if (v.id && (v.name || v.title || v.projectName || v.userName)) {
      return `${v.id} - ${v.name || v.title || v.projectName || v.userName}`;
    }
    try {
      return JSON.stringify(v);
    } catch (e) {
      return String(v);
    }
  }
  return String(v);
}
