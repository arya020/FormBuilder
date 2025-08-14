import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import FormEditor from './components/FormEditor/FormEditor';
import Preview from './components/FormPreview/FormPreview';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={<FormEditor />} 
          />
          <Route 
            path="/:formId" 
            element={
              <div className="min-h-screen bg-[#d2ffd9ad]">
                <div className="max-w-4xl mx-auto py-8">
                  <PreviewWrapper />
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

const PreviewWrapper = () => {
  const { formId } = useParams();
  return <Preview formId={formId} />;
};

export default App;