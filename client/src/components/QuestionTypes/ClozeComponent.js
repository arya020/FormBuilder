import React, { useState } from "react";

const ClozeComponent = ({ q }) => {
  const [filledBlanks, setFilledBlanks] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, word) => {
    e.dataTransfer.setData("text/plain", word);
    setDraggedItem(word);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = (e, blankId) => {
    e.preventDefault();
    const droppedWord = e.dataTransfer.getData("text/plain");
    
    // Remove the word from any other blank it might be in
    const updatedBlanks = { ...filledBlanks };
    Object.keys(updatedBlanks).forEach(key => {
      if (updatedBlanks[key] === droppedWord) {
        delete updatedBlanks[key];
      }
    });
    
    // Add the word to the new blank
    updatedBlanks[blankId] = droppedWord;
    setFilledBlanks(updatedBlanks);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeWordFromBlank = (blankId) => {
    setFilledBlanks(prev => {
      const updated = { ...prev };
      delete updated[blankId];
      return updated;
    });
  };

  const renderSentenceWithBlanks = () => {
    const sentence = q.content.sentence;
    const blanks = q.content.blanks.sort((a, b) => a.start - b.start); // Sort by position
    
    let result = [];
    let currentPos = 0;
    
    blanks.forEach((blank, index) => {
      // Add text before the blank
      if (currentPos < blank.start) {
        const textBefore = sentence.substring(currentPos, blank.start);
        result.push(
          <span key={`text-${index}-before`} className="mx-0">
            {textBefore}
          </span>
        );
      }
      
      // Add the blank (drop zone)
      const filledWord = filledBlanks[blank.id];
      result.push(
        <span
          key={`blank-${blank.id}`}
          onDrop={(e) => handleDrop(e, blank.id)}
          onDragOver={handleDragOver}
          onClick={() => filledWord && removeWordFromBlank(blank.id)}
          className={`
            inline-flex items-center justify-center min-w-[80px] h-[35px] mx-1 
            border-2 border-dashed rounded-md transition-all duration-200
            ${filledWord 
              ? 'border-blue-500 bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100' 
              : 'border-gray-400 bg-gray-50 hover:border-gray-600'
            }
            ${draggedItem && !filledWord ? 'border-green-500 bg-green-50' : ''}
          `}
          title={filledWord ? "Click to remove" : "Drop word here"}
        >
          {filledWord || `_`.repeat(blank.word.length)}
        </span>
      );
      
      currentPos = blank.end;
    });
    
    // Add remaining text after the last blank
    if (currentPos < sentence.length) {
      const textAfter = sentence.substring(currentPos);
      result.push(
        <span key="text-after" className="mx-0">
          {textAfter}
        </span>
      );
    }
    
    return result;
  };

  const getAvailableOptions = () => {
    const usedWords = Object.values(filledBlanks);
    return q.content.options.filter(option => !usedWords.includes(option));
  };

  const checkAnswer = () => {
    const correctAnswers = q.content.blanks.every(blank => 
      filledBlanks[blank.id] === blank.word
    );
    return correctAnswers;
  };

  const isComplete = Object.keys(filledBlanks).length === q.content.blanks.length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          Drag the words below to fill in the blanks. Click on filled blanks to remove words.
        </p>
      </div>

      {/* Sentence with drop zones */}
      <div className="mb-6 p-4 bg-white border rounded-lg shadow-sm">
        <p className="text-lg leading-relaxed flex flex-wrap items-center">
          {renderSentenceWithBlanks()}
        </p>
      </div>

      {/* Available options */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Available Words:</h3>
        <div className="flex flex-wrap gap-2">
          {getAvailableOptions().map((option, index) => (
            <div
              key={`option-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, option)}
              onDragEnd={handleDragEnd}
              className={`
                px-4 py-2 border rounded-lg cursor-move transition-all duration-200
                bg-white border-gray-300 text-gray-800 shadow-sm
                hover:shadow-md hover:border-blue-400 hover:bg-blue-50
                active:scale-95
                ${draggedItem === option ? 'opacity-50 scale-95' : ''}
              `}
            >
              {option}
            </div>
          ))}
        </div>
        
        {getAvailableOptions().length === 0 && (
          <p className="text-sm text-gray-500 italic">All words have been used!</p>
        )}
      </div>

      {/* Progress and feedback <div className="mt-4 space-y-3"> */}
      
        {/* Progress indicator 
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Progress:</span>
            <span>{Object.keys(filledBlanks).length} / {q.content.blanks.length} blanks filled</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(filledBlanks).length / q.content.blanks.length) * 100}%` }}
            ></div>
          </div>
        </div>*/}

        {/* Completion feedback 
        {isComplete && (
          <div className={`p-3 rounded-lg ${checkAnswer() ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {checkAnswer() ? '✅' : '⚠️'}
              </span>
              <span className="font-medium">
                {checkAnswer() ? 'Perfect! All answers are correct!' : 'Exercise complete! Check your answers.'}
              </span>
            </div>
          </div>
        )}
      </div> */}

      {/* Points display */}
      {/*q.content.points && (
        <div className="mt-4 text-sm text-gray-600 text-right">
          Points: {q.content.points}
        </div>
      )*/}
    </div>
  );
};

export default ClozeComponent;