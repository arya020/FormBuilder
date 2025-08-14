import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const ClozeCreator = ({ title, onChange }) => {
  const [sentence, setSentence] = useState('');
  const [blanks, setBlanks] = useState([]);
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState('');

  const textareaRef = useRef(null);

  useEffect(() => {
    if (onChange) {
      onChange({
        sentence,
        blanks,
        options,
      });
    }
  }, [sentence, blanks, options]);

  const handleTextSelection = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = sentence.substring(start, end).trim();

    if (selectedText && start !== end) {
      // Check if this word is already a blank
      const existingBlank = blanks.find(blank => 
        blank.start <= start && blank.end >= end
      );

      if (!existingBlank) {
        const newBlank = {
          id: Date.now(),
          word: selectedText,
          start,
          end,
          position: blanks.length
        };

        setBlanks([...blanks, newBlank]);
        
        // Add to options if not already present
        if (!options.includes(selectedText)) {
          setOptions([...options, selectedText]);
        }
      }
    }
  };

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (optionToRemove) => {
    setOptions(options.filter(option => option !== optionToRemove));
  };

  const removeBlanks = (word) => {
    setBlanks(blanks.filter(blank => blank.word !== word));
  };

  const renderSentenceWithBlanks = () => {
    if (blanks.length === 0) return sentence;

    // Sort blanks by start position
    const sortedBlanks = [...blanks].sort((a, b) => a.start - b.start);
    let result = [];
    let lastIndex = 0;

    sortedBlanks.forEach((blank, index) => {
      // Add text before the blank
      if (blank.start > lastIndex) {
        result.push(sentence.substring(lastIndex, blank.start));
      }

      // Add blank placeholder
      result.push(
        <span
          key={blank.id}
          className="bg-blue-200 px-1 rounded mx-1 cursor-pointer"
          title="Click to remove blank"
          onClick={() => {
            setBlanks(blanks.filter(b => b.id !== blank.id));
          }}
        >
          [{blank.word}]
        </span>
      );

      lastIndex = blank.end;
    });

    // Add remaining text
    if (lastIndex < sentence.length) {
      result.push(sentence.substring(lastIndex));
    }

    return result;
  };

  const resetExercise = () => {
    setSentence('');
    setBlanks([]);
    setOptions([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <p className="text-gray-600">Create fill-in-the-blank exercises by entering text and highlighting words to turn into blanks.</p>
      </div>

      <div className="space-y-6">
        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your sentence:
          </label>
          <textarea
            ref={textareaRef}
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            rows="4"
            placeholder="Type your sentence here, then select words to turn them into blanks..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Select text with your mouse or keyboard to create blanks
          </p>
        </div>

        {/* Preview of sentence with blanks */}
        {sentence && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview (click blue highlights to remove blanks):
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[60px]">
              <div className="text-lg leading-relaxed">
                {renderSentenceWithBlanks()}
              </div>
            </div>
          </div>
        )}

        {/* Options Management */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Answer Options:
          </label>
          
          {/* Add new option */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addOption()}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a new option..."
            />
            <button
              onClick={addOption}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          {/* Options list */}
          <div className="flex flex-wrap gap-2">
            {options.map((option, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full"
              >
                <span>{option}</span>
                <button
                  onClick={() => {
                    removeOption(option);
                    removeBlanks(option);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={resetExercise}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClozeCreator;