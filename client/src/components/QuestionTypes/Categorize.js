import React, { useState, useEffect } from "react";

export default function Categorize({title, onChange}) {
  const [items, setItems] = useState([]);
  const [containers, setContainers] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [newItemText, setNewItemText] = useState("");
  const [newContainerTitle, setNewContainerTitle] = useState("");

  useEffect(() => {
  if (onChange) {
    onChange({
      items,
      containers,
    });
  }
  }, [items, containers]);

  const handleDragStart = (itemId) => {
    setDraggedItem(itemId);
  };

  const handleDrop = (containerId) => {
    if (!draggedItem) return;

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === draggedItem ? { ...item, containerId } : item
      )
    );
    setDraggedItem(null);
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newItemText, containerId: null },
    ]);
    setNewItemText("");
  };

  const handleAddContainer = () => {
    if (!newContainerTitle.trim()) return;
    setContainers((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newContainerTitle },
    ]);
    setNewContainerTitle("");
  };

  const categorizedData = containers.map((container) => ({
    containerId: container.id,
    title: container.title,
    items: items.filter((item) => item.containerId === container.id),
  }));

  return (
    <div className="p-4">
      <div className="flex gap-6">
      {/* Add Item */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New Item"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          className="border p-1 rounded"
        />
        <button
          onClick={handleAddItem}
          className="bg-blue-500 text-white px-4 py-1 rounded-3xl"
        >
          Add Item
        </button>
      </div>

      {/* Add Container */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New Container"
          value={newContainerTitle}
          onChange={(e) => setNewContainerTitle(e.target.value)}
          className="border p-1 rounded"
        />
        <button
          onClick={handleAddContainer}
          className="bg-green-500 text-white px-4 py-1 rounded-3xl"
        >
          Add Container
        </button>
      </div>
    </div>

    {/* Containers */}
    <div className="flex gap-4 mt-6">
      {containers.map((container) => (
        <div
          key={container.id}
          className="border rounded p-3 w-64 min-h-[150px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(container.id)}
        >
          <h3 className="font-bold mb-2">{container.title}</h3>
          {items
            .filter((item) => item.containerId === container.id)
            .map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                className="p-2 border bg-gray-100 mb-2 cursor-grab rounded-lg"
              >
                {item.text}
              </div>
            ))}
        </div>
      ))}
    </div>

      {/* Unassigned Items */}
      <div>
        <h3 className="font-bold mb-2">Unassigned Items</h3>
        <div className="flex gap-2 flex-wrap">
          {items
            .filter((item) => !item.containerId)
            .map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                className="p-2 border rounded bg-blue-100 cursor-grab"
              >
                {item.text}
              </div>
            ))}
        </div>
      </div>

      {/* Debug: Categorized Data 
      <pre className="bg-gray-100 p-2 rounded">
        {JSON.stringify(categorizedData, null, 2)}
      </pre>
      */}
    </div>
  );
}
