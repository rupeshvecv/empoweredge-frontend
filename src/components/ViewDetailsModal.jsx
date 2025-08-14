import React from "react";

export default function ViewDetailsModal({ title, data, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <table className="table text-sm">
          <tbody>
            {Object.entries(data).map(([k, v]) => (
              <tr key={k}>
                <td className="font-semibold">{k}</td>
                <td>{typeof v === "object" ? JSON.stringify(v) : v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
      <div onClick={onClose} className="fixed inset-0" />
    </div>
  );
}
