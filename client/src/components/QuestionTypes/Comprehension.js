import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

const Comprehension = ({ title: initialTitle, onChange }) => {
  const [title, setTitle] = useState("Comprehension Title");
  const [passage, setPassage] = useState("Enter the comprehension passage here...");
  const [questions, setQuestions] = useState([]);

   useEffect(() => {
    if (onChange) {
      onChange({
        title,
        passage,
        questions: questions.map(({ id, ...rest }) => rest), // omit internal id
      });
    }
  }, [title, passage, questions]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: "New Question",
        options: ["", "", "", ""],
        answer: null, // Initially no answer selected
      },
    ]);
  };

  const updateQuestionText = (id, text) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text } : q))
    );
  };

  const updateOptionText = (id, idx, text) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              options: q.options.map((o, i) => (i === idx ? text : o)),
            }
          : q
      )
    );
  };

  const updateAnswer = (id, answerIndex) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, answer: answerIndex } : q
      )
    );
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  /* Get JSON output of the comprehension
  const getJsonOutput = () => {
    return JSON.stringify(
      {
        title,
        passage,
        questions: questions.map(({ id, ...rest }) => rest), // Remove id in final JSON
      },
      null,
      2
    );
  };*/

  return (
    <div className="border p-4 rounded-md bg-white shadow-md">
      {/* Title */}
      <input
        className="w-full font-bold text-lg border-b mb-2 outline-none"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Passage */}
      <textarea
        className="w-full border p-2 mb-4 rounded-md outline-none"
        rows="5"
        value={passage}
        onChange={(e) => setPassage(e.target.value)}
      />
      <p className="text-gray-400 text-center">
        Mark answers with radio buttons next to each question.
      </p>
      {/* Questions Section */}
      <div className="min-h-[50px] border border-gray-300 p-2 rounded-md">
        {questions.length === 0 && (
          <p className="text-gray-400 text-center">
            No questions yet. Click below to add one.
          </p>
        )}

        {questions.map((q) => (
          <div key={q.id} className="border p-3 my-2 rounded-md bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <input
                className="w-full border-b outline-none font-medium"
                value={q.text}
                onChange={(e) => updateQuestionText(q.id, e.target.value)}
              />
              <button
                className="ml-2 text-red-500 hover:text-red-700"
                onClick={() => deleteQuestion(q.id)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Options with Answer Selector */}
            {q.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-1">
                <input
                  className="w-full border p-1 rounded-md outline-none"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => updateOptionText(q.id, idx, e.target.value)}
                />
                <input
                  type="radio"
                  name={`answer-${q.id}`}
                  checked={q.answer === idx}
                  onChange={() => updateAnswer(q.id, idx)}
                  title="Mark as answer"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      <button
        onClick={addQuestion}
        className="inline-flex items-center mt-4 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        <Plus size={16} className="mr-1" /> New Question
      </button>

      {/* JSON Output 
      {questions.length > 0 && (
        <pre className="mt-4 bg-gray-100 p-2 rounded-md text-sm overflow-auto">
          {getJsonOutput()}
        </pre>
      )} */}
    </div>
  );
};

export default Comprehension;
