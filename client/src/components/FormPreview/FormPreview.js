import React, { useEffect, useState } from "react";
import { formAPI } from "../../services/Api.js";
import ClozeComponent from "../QuestionTypes/ClozeComponent.js";
import CategorizeComponent from "../QuestionTypes/CategorizeComponent.js";

const FormPreview = ({ formId, onClose }) => {
  const [formData, setFormData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [categorizeData, setCategorizeData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (formId) {
      formAPI.getForm(formId).then((res) => {
        setFormData(res.data);

        const catQuestions = {};
        res.data.questions
          .filter((q) => q.type === "categorize")
          .forEach((q) => {
            const unassigned = q.content.items.filter((i) => !i.containerId);
            const containers = {};
            q.content.containers.forEach((c) => {
              containers[c.id] = q.content.items
                .filter((i) => i.containerId === c.id)
                .map((i) => i.id);
            });
            catQuestions[q.id] = {
              unassigned: unassigned.map((i) => i.id),
              containers,
              itemsMap: q.content.items.reduce((acc, i) => {
                acc[i.id] = i.text;
                return acc;
              }, {}),
            };
          });
        setCategorizeData(catQuestions);
      });
    }
  }, [formId]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const payload = {
        formId,
        answers
      };

      await formAPI.submitResponse(payload);
      alert("Responses submitted successfully!");
      window.location.href = `/`;
    } catch (err) {
      console.error("Failed to submit responses:", err);
      alert("Failed to submit responses.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!formData) return <div className="p-6">Loading preview...</div>;


  const renderCategorize = (q) => {
    return <CategorizeComponent q={q} />;
  };

  const renderCloze = (q) => {
    return <ClozeComponent q={q} />;
  };

  const renderComprehension = (q) => {
    return (
      <div className="mt-2">
        {q.content.questions.map((ques, idx) => (
          <div key={idx} className="mb-2">
            <p className="font-medium">{ques.text}</p>
            <div className="flex flex-col gap-1 mt-1">
              {ques.options.map((opt, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`comp-${q.id}-${idx}`}
                    value={i}
                    checked={answers[q.id]?.[idx] === i}
                    onChange={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: { ...prev[q.id], [idx]: i },
                      }))
                    }
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-50 rounded-lg shadow-md">
        {formData.headerImage && (
        <div className="relative w-full h-60 mb-6 rounded-lg overflow-hidden">
          <img
            src={formData.headerImage}
            alt="Form Header"
            className="w-full h-full object-cover"
          />
          <h2 className="absolute bottom-3 left-4 text-3xl font-bold text-white drop-shadow-lg">
            {formData.title}
          </h2>
        </div>
      )}

      {formData.questions.map((q, idx) => (
        <div key={q.id} className="mb-4 border p-6 m-6 rounded bg-white">
          <h3 className="font-semibold">
            Question {idx + 1}: {q.type.charAt(0).toUpperCase() + q.type.slice(1)}
          </h3>
          { q.image && <img src={q.image} alt="Question" className="w-full h-60 object-cover my-4 rounded" />}
          {q.type === "categorize" && renderCategorize(q)}
          {q.type === "cloze" && renderCloze(q)}
          {q.type === "comprehension" && renderComprehension(q)}
        </div>
      ))}

      <div className="p-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`px-6 py-2 rounded-lg text-white ${
            submitting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          } transition-colors`}
        >
          {submitting ? "Submitted" : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default FormPreview;
