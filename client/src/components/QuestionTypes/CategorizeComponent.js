import React, { useEffect, useState, useCallback } from "react";

const CategorizeComponent = ({ q }) => {
  // Generate pastel colors for containers
  const pastelColors = [
    'bg-red-100 border-red-200',
    'bg-blue-100 border-blue-200', 
    'bg-green-100 border-green-200',
    'bg-yellow-100 border-yellow-200',
    'bg-purple-100 border-purple-200',
    'bg-pink-100 border-pink-200',
    'bg-indigo-100 border-indigo-200',
    'bg-orange-100 border-orange-200',
    'bg-teal-100 border-teal-200',
    'bg-cyan-100 border-cyan-200',
    'bg-lime-100 border-lime-200',
    'bg-rose-100 border-rose-200'
  ];

  // Initialize state for categorize data
  const [categorizeData, setCategorizeData] = useState(() => {
    const itemsMap = {};
    const unassigned = [];
    
    // Create items map and unassigned list
    q.content.items.forEach(item => {
      itemsMap[item.id] = item.text;
      unassigned.push(item.id);
    });

    // Initialize empty containers
    const containers = {};
    q.content.containers.forEach(container => {
      containers[container.id] = [];
    });

    return {
      [q.id]: {
        itemsMap,
        unassigned,
        containers
      }
    };
  });

  const [draggedItem, setDraggedItem] = useState(null);

  const onDragStart = useCallback((e, questionId, itemId) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ questionId, itemId }));
    setDraggedItem(itemId);
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const allowDrop = useCallback((e) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback((e, questionId, containerId) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const { itemId } = data;

    setCategorizeData(prev => {
      const qData = prev[questionId];
      if (!qData) return prev;

      // Remove item from its current location
      const newContainers = { ...qData.containers };
      const newUnassigned = [...qData.unassigned];

      // Remove from unassigned
      const unassignedIndex = newUnassigned.indexOf(itemId);
      if (unassignedIndex > -1) {
        newUnassigned.splice(unassignedIndex, 1);
      }

      // Remove from any container
      Object.keys(newContainers).forEach(cId => {
        const index = newContainers[cId].indexOf(itemId);
        if (index > -1) {
          newContainers[cId] = newContainers[cId].filter(id => id !== itemId);
        }
      });

      // Add to new location
      if (containerId === "unassigned") {
        newUnassigned.push(itemId);
      } else {
        if (!newContainers[containerId]) {
          newContainers[containerId] = [];
        }
        newContainers[containerId].push(itemId);
      }

      return {
        ...prev,
        [questionId]: {
          ...qData,
          containers: newContainers,
          unassigned: newUnassigned
        }
      };
    });
    setDraggedItem(null);
  }, []);

  const qData = categorizeData[q.id];
  if (!qData) return null;

  const getContainerColor = (index) => {
    return pastelColors[index % pastelColors.length];
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Instructions */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          Drag items from the "Items" section below into the appropriate categories.
        </p>
      </div>

      {/* Containers in a horizontal layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {q.content.containers.map((container, index) => (
          <div
            key={container.id}
            onDrop={(e) => onDrop(e, q.id, container.id)}
            onDragOver={allowDrop}
            className={`
              border-2 border-dashed p-4 min-h-[150px] rounded-lg transition-all duration-200
              ${getContainerColor(index)}
              ${draggedItem ? 'border-opacity-80 shadow-md' : 'border-opacity-50'}
            `}
          >
            <h4 className="font-semibold mb-3 text-gray-800 text-center">
              {container.title}
            </h4>
            
            {/* Items in container - horizontal layout */}
            <div className="flex flex-wrap gap-2 min-h-[80px]">
              {qData.containers[container.id].map((itemId) => (
                <div
                  key={itemId}
                  draggable
                  onDragStart={(e) => onDragStart(e, q.id, itemId)}
                  onDragEnd={onDragEnd}
                  className={`
                    bg-white px-3 py-2 rounded-md cursor-move shadow-sm border
                    transition-all duration-200 hover:shadow-md hover:scale-105
                    ${draggedItem === itemId ? 'opacity-50 scale-95' : ''}
                    text-sm font-medium text-gray-700
                  `}
                >
                  {qData.itemsMap[itemId]}
                </div>
              ))}
              
              {/* Empty state */}
              {qData.containers[container.id].length === 0 && (
                <div className="w-full h-20 flex items-center justify-center text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-md">
                  Drop items here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Unassigned items section */}
      <div
        onDrop={(e) => onDrop(e, q.id, "unassigned")}
        onDragOver={allowDrop}
        className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50"
      >
        <h4 className="font-semibold mb-3 text-gray-800">Available Items</h4>
        
        {/* Items in horizontal layout */}
        <div className="flex flex-wrap gap-2">
          {qData.unassigned.map((itemId) => (
            <div
              key={itemId}
              draggable
              onDragStart={(e) => onDragStart(e, q.id, itemId)}
              onDragEnd={onDragEnd}
              className={`
                bg-white px-4 py-2 rounded-lg cursor-move shadow-sm border-2 border-gray-200
                transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-blue-300
                ${draggedItem === itemId ? 'opacity-50 scale-95' : ''}
                text-sm font-medium text-gray-700
              `}
            >
              {qData.itemsMap[itemId]}
            </div>
          ))}
        </div>

        {qData.unassigned.length === 0 && (
          <p className="text-gray-400 text-sm italic text-center py-4">
            All items have been categorized!
          </p>
        )}
      </div>

      {/* Progress indicator 
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Progress:</span>
          <span>
            {q.content.items.length - qData.unassigned.length} / {q.content.items.length} items categorized
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${((q.content.items.length - qData.unassigned.length) / q.content.items.length) * 100}%` 
            }}
          ></div>
        </div>
      </div> */}
    </div>
  );
};

export default CategorizeComponent;