import React, { useState, useEffect } from 'react';
import { 
  Move, 
  BookOpen, 
  Type, 
  Grid3X3,
  Trash2,
  Eye,
  Save
} from 'lucide-react';

import Categorize from '../QuestionTypes/Categorize.js';
import Cloze from '../QuestionTypes/Cloze.js';
import Comprehension from '../QuestionTypes/Comprehension.js';
import HeaderImage from './HeaderImage.js';
import { formAPI } from '../../services/Api.js';

const FormEditor = () => {
  const [Title, setTitle] = useState("Untitled Form");
  const [formComponents, setFormComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [draggedComponentType, setDraggedComponentType] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [save,setSave] = useState(false);
  const [formId, setFormId] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [headerImage, setHeaderImage] = useState('');

  useEffect(() => {
    const loadFormData = async () => {
      if (formId) {
        try {
          const response = await formAPI.getForm(formId); 
          const formData = response.data;
          
          setTitle(formData.title || "Untitled Form");
          setFormComponents(formData.questions || []);
          setHeaderImage(formData.headerImage || '');
          setSave(true);
        } catch (error) {
          console.error('Failed to load form data:', error);
          alert('Failed to load form data');
        }
      }
    };

    loadFormData();
  }, [formId]);

  // Available question types
  const questionTypes = [
    { 
      type: 'categorize', 
      label: 'Categorize', 
      icon: Grid3X3,
      component: Categorize
    },
    { 
      type: 'cloze', 
      label: 'Cloze', 
      icon: Type,
      component: Cloze
    },
    { 
      type: 'comprehension', 
      label: 'Comprehension', 
      icon: BookOpen,
      component: Comprehension
    }
  ];

  // Drag handlers
  const handleSidebarDragStart = (e, componentType) => {
    setDraggedComponentType(componentType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleFormAreaDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleFormAreaDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDraggingOver(false);
    }
  };

  const handleFormAreaDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (draggedComponentType) {
      const questionConfig = questionTypes.find(q => q.type === draggedComponentType);
      const newComponent = {
        id: `question_${Date.now()}`,
        type: draggedComponentType,
        title: `${questionConfig.label} Question ${formComponents.length + 1}`,
        createdAt: new Date().toISOString(),
        content: {}
      };

      setFormComponents(prev => [...prev, newComponent]);
      setDraggedComponentType(null);
    }
  };

  // Component management
  const removeComponent = (componentId) => {
    setFormComponents(prev => prev.filter(c => c.id !== componentId));
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
  };

  const moveComponent = (componentId, direction) => {
    const index = formComponents.findIndex(c => c.id === componentId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formComponents.length) return;

    const newComponents = [...formComponents];
    const [removed] = newComponents.splice(index, 1);
    newComponents.splice(newIndex, 0, removed);
    setFormComponents(newComponents);
  };

  const updateQuestionData = (id, newData) => {
    setFormComponents(prev =>
      prev.map(q => (q.id === id ? { ...q, content: newData } : q))
    );
  };

   const handleHeaderImageChange = async (newImageUrl) => {
    setHeaderImage(newImageUrl);
    
    if (formId && save) {
      try {
        await formAPI.updateForm(formId, { headerImage: newImageUrl });
        console.log('Header image updated successfully');
      } catch (error) {
        console.error('Failed to update header image:', error);
        alert('Failed to update header image');
      }
    }
  };

  const handleSaveForm = async () => {
    if (Title.trim() === "Untitled Form") {
      alert("Please enter a form title before saving.");
      return;
    }

    const formData = { 
      title: Title,
      questions: formComponents,
      headerImage: headerImage,
    };

    try {
      let response;
      if (formId && save) {
        // Update existing form
        response = await formAPI.updateForm(formId, formData);
        alert("Form updated successfully!");
      } else {
        // Create new form
        response = await formAPI.createForm(formData);
        setSave(true);
        setFormId(response.data._id);
        alert("Form saved successfully!");
      }
      console.log('Form saved:', response.data);
    } catch (error) {
      console.error('Failed to save form:', error);
      alert('Failed to save form');
    }
  };

  const handlePreview = () => {
    if (!formId && formComponents.length === 0) {
      alert("Please add some questions to preview the form.");
      return;
    }

    if (!formId && !save) {
      alert("Please save the form first before previewing.");
      return;
    }
    window.location.href = `/${formId}`;
    setIsPreviewOpen(true);
  };


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-[#19191b] border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-600">
          <h2 className="text-xl font-bold text-white mb-2">Types of Questions</h2>
          <p className="text-sm text-white">Drag question types to add them to your form</p>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {questionTypes.map((questionType) => {
              const Icon = questionType.icon;
              return (
                <div
                  key={questionType.type}
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, questionType.type)}
                  className="flex items-start p-4 bg-[#242424] rounded-xl cursor-move hover:bg-[#383838] hover:shadow-md transition-all duration-200 border border-gray-600 group"
                >
                  <div className="flex-shrink-0 p-1 bg-white rounded-lg border border-gray-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                    <Icon size={20} className="text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-white mb-1">{questionType.label}</h3>
                    <p className="text-sm text-white leading-relaxed">
                      {questionType.type === 'categorize' && 'Drag and drop items into categories'}
                      {questionType.type === 'cloze' && 'Fill in the blanks question'}
                      {questionType.type === 'comprehension' && 'Reading comprehension with questions'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-gray-600 bg-[#19191b]">
          <div className="text-center text-sm text-white">
            <p className="mb-2">Total Questions: {formComponents.length}</p>
            <div className="flex justify-center space-x-4">
              <span className="flex items-center">
                <Grid3X3 size={14} className="mr-1" />
                {formComponents.filter(c => c.type === 'categorize').length}
              </span>
              <span className="flex items-center">
                <Type size={14} className="mr-1" />
                {formComponents.filter(c => c.type === 'cloze').length}
              </span>
              <span className="flex items-center">
                <BookOpen size={14} className="mr-1" />
                {formComponents.filter(c => c.type === 'comprehension').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <input
                className="text-2xl font-bold text-gray-800"
                value={Title}
                placeholder='Untitled Form'
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-sm text-gray-600 mt-1">Create and organize your questions</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" onClick={handlePreview}>
                <Eye size={16} />
                Preview
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" onClick={handleSaveForm}> 
                <Save size={16} />
                Save Form
              </button>
            </div>
          </div>
        </div>

        {/* Form Canvas */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div
            className={`min-h-full bg-white rounded-xl border-2 border-dashed p-8 transition-all duration-200 ${
              isDraggingOver 
                ? 'border-blue-400 bg-blue-50 shadow-lg' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleFormAreaDragOver}
            onDragLeave={handleFormAreaDragLeave}
            onDrop={handleFormAreaDrop}
          >
            <HeaderImage onChange={handleHeaderImageChange} value={headerImage} />
            {formComponents.length === 0 ? (
              <div className="text-center py-24 text-gray-500">
                <div className="mb-6">
                  <Move size={64} className="mx-auto mb-4 text-gray-300" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-gray-700">Start Building Your Form</h3>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                  Drag question types from the sidebar to create your form.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {formComponents.map((component, index) => {
                  const questionConfig = questionTypes.find(q => q.type === component.type);
                  const QuestionComponent = questionConfig?.component || (() => null);
                  return (
                    <div
                      key={component.id}
                      className={`relative group transition-all duration-200 ${
                        selectedComponent?.id === component.id 
                          ? 'ring-2 ring-blue-500 ring-offset-2' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedComponent(component)}
                    >
                      {/* Component Controls */}
                      <div className="absolute -top-3 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveComponent(component.id, 'up');
                          }}
                          disabled={index === 0}
                          className="p-2 bg-white border border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveComponent(component.id, 'down');
                          }}
                          disabled={index === formComponents.length - 1}
                          className="p-2 bg-white border border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeComponent(component.id);
                          }}
                          className="p-2 bg-white border border-red-300 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 shadow-sm transition-all"
                          title="Remove question"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Question Number Badge */}
                      <div className="absolute -left-12 top-4 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-md">
                        {index + 1}
                      </div>
                      <div className="mb-3">
                      <label className="block text-sm p-2 font-medium text-gray-700">Upload Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          try {
                            const response = await formAPI.uploadImage(file); // Your API call
                            const imageUrl = response.data.url;

                            setFormComponents((prev) =>
                              prev.map((q) =>
                                q.id === component.id ? { ...q, image: imageUrl } : q
                              )
                            );
                          } catch (error) {
                            console.error("Image upload failed:", error);
                            alert("Failed to upload image");
                          }
                        }}
                        className="mt-1 p-2 block w-full text-sm text-gray-700"
                      />
                      {component.image && (
                        <img
                          src={component.image}
                          alt="Question"
                          className="mt-2 w-32 h-32 object-cover border rounded"
                        />
                      )}
                    </div>

                      {/* Render actual question component */}
                      <QuestionComponent title={component.title} onChange={(newData) => updateQuestionData(component.id, newData)}/>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormEditor;
