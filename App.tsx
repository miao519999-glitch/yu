
import React, { useState, useRef } from 'react';
import { Camera, Book, Share2, Clipboard, Brain, HelpCircle, ArrowRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { TabType, AIAnalysisResult, Word, QuizQuestion } from './types';
import { analyzeTextbookImage } from './services/geminiService';

// --- Helper Components ---

const iPhoneContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-center min-h-screen p-4 bg-gray-200">
    <div className="relative w-full max-w-[390px] h-[844px] bg-white rounded-[50px] shadow-2xl overflow-hidden border-[8px] border-black">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50"></div>
      <div className="h-full overflow-y-auto pt-8 pb-20 bg-[#F2F2F7]">
        {children}
      </div>
    </div>
  </div>
);

const TabButton: React.FC<{ 
  active: boolean; 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void 
}> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-1 transition-colors ${active ? 'text-blue-600' : 'text-gray-400'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const WordCard: React.FC<{ word: Word }> = ({ word }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm mb-3 border border-gray-100">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{word.word}</h3>
        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">{word.pos}</span>
      </div>
      <button className="p-1 text-gray-300 hover:text-blue-500">
        <Share2 size={16} />
      </button>
    </div>
    <p className="text-sm text-gray-700 font-medium mb-1">{word.definitionEn}</p>
    <p className="text-sm text-gray-500 mb-2">{word.definitionZh}</p>
    <div className="bg-gray-50 p-2 rounded-lg text-xs italic text-gray-600 border-l-4 border-blue-200">
      "{word.example}"
    </div>
    {word.derivatives && word.derivatives.length > 0 && (
      <div className="mt-2 pt-2 border-t border-gray-50 flex flex-wrap gap-1">
        {word.derivatives.map((d, i) => (
          <span key={i} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{d}</span>
        ))}
      </div>
    )}
  </div>
);

const GrammarCard: React.FC<{ point: any }> = ({ point }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm mb-3 border-l-4 border-green-500">
    <h3 className="text-sm font-bold text-gray-900 mb-1">{point.pattern}</h3>
    <p className="text-xs text-gray-600 mb-2">{point.explanation}</p>
    <div className="bg-green-50 p-2 rounded-lg text-xs font-mono text-green-800 mb-1">
      {point.structure}
    </div>
    <p className="text-[11px] italic text-gray-500">Example: {point.example}</p>
  </div>
);

const MindMap: React.FC<{ data: any }> = ({ data }) => {
  const renderNode = (node: any, depth = 0) => (
    <div key={node.label} className={`ml-${depth * 4} mt-2`}>
      <div className={`p-2 rounded-lg border flex items-center gap-2 ${depth === 0 ? 'bg-blue-600 text-white font-bold' : 'bg-white border-gray-200 text-gray-700'}`}>
        <div className={`w-2 h-2 rounded-full ${depth === 0 ? 'bg-white' : 'bg-blue-400'}`} />
        <span className="text-sm">{node.label}</span>
      </div>
      {node.children?.map((child: any) => renderNode(child, depth + 1))}
    </div>
  );

  return (
    <div className="p-4 overflow-x-auto">
      {renderNode(data)}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('scan');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const analysis = await analyzeTextbookImage(base64String);
        setResult(analysis);
        setActiveTab('notes');
      } catch (err) {
        alert("Failed to analyze image. Please check your API key or try again.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderScanView = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-8 animate-pulse">
        <Camera className="text-blue-600" size={48} />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan Your Textbook</h1>
      <p className="text-gray-500 mb-10 leading-relaxed">
        Snap a photo of your English book to instantly generate notes, mind maps, and quizzes.
      </p>
      
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        hidden 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
      />
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Camera size={20} />
            <span>Take Photo</span>
          </>
        )}
      </button>

      <div className="mt-8 flex gap-4">
        <div className="text-center">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-1">
            <Book size={18} className="text-blue-500" />
          </div>
          <span className="text-[10px] text-gray-400">OCR Analysis</span>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-1">
            <Brain size={18} className="text-purple-500" />
          </div>
          <span className="text-[10px] text-gray-400">Mind Maps</span>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-1">
            <HelpCircle size={18} className="text-orange-500" />
          </div>
          <span className="text-[10px] text-gray-400">Quiz Gen</span>
        </div>
      </div>
    </div>
  );

  const renderNotesView = () => (
    <div className="px-5 space-y-6">
      <div className="sticky top-0 bg-[#F2F2F7] py-4 z-10">
        <h2 className="text-2xl font-black text-gray-900">{result?.title || 'Chapter Notes'}</h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Generated by AI</p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clipboard size={18} className="text-blue-600" />
          <h3 className="text-sm font-bold text-gray-400 uppercase">Vocabulary</h3>
        </div>
        {result?.vocabulary.map((w, i) => <WordCard key={i} word={w} />)}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Book size={18} className="text-green-600" />
          <h3 className="text-sm font-bold text-gray-400 uppercase">Grammar & Usage</h3>
        </div>
        {result?.grammar.map((g, i) => <GrammarCard key={i} point={g} />)}
      </section>

      <section className="bg-white p-5 rounded-3xl shadow-sm">
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Writing Context</h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          {result?.background}
        </p>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h4 className="text-xs font-bold text-gray-500 mb-2">Structure Logic ({result?.writing.type})</h4>
          <p className="text-xs text-gray-600 mb-3">{result?.writing.logic}</p>
          <div className="space-y-2">
            {result?.writing.framework.map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const renderMindMapView = () => (
    <div className="p-5 h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900">Knowledge Map</h2>
        <p className="text-xs text-gray-400">Visualizing key concepts and connections</p>
      </div>
      <div className="bg-gray-50 rounded-3xl p-2 min-h-[500px] border border-gray-100">
        <MindMap data={result?.mindMap} />
      </div>
    </div>
  );

  const renderPracticeView = () => {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
      let correctCount = 0;
      result?.quizzes.forEach(q => {
        if (answers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()) {
          correctCount++;
        }
      });
      setQuizScore({ correct: correctCount, total: result?.quizzes.length || 0 });
      setSubmitted(true);
    };

    return (
      <div className="px-5 pb-10">
        <div className="mb-6 sticky top-0 bg-[#F2F2F7] py-4 z-10">
          <h2 className="text-2xl font-black text-gray-900">Quiz Challenge</h2>
          <p className="text-xs text-gray-400">Test your understanding</p>
        </div>

        {submitted && quizScore && (
          <div className="mb-6 bg-white p-6 rounded-3xl shadow-lg border-2 border-blue-100 text-center animate-bounce-in">
            <h3 className="text-lg font-bold mb-1">Your Score</h3>
            <div className="text-4xl font-black text-blue-600 mb-2">{quizScore.correct} / {quizScore.total}</div>
            <p className="text-sm text-gray-500 mb-4">
              {quizScore.correct === quizScore.total ? "Perfect Mastery! 🎉" : "Good effort! Keep studying."}
            </p>
            <button 
              onClick={() => { setSubmitted(false); setAnswers({}); setQuizScore(null); }}
              className="text-blue-600 text-sm font-bold flex items-center justify-center gap-1 mx-auto"
            >
              Try Again <ArrowRight size={14} />
            </button>
          </div>
        )}

        <div className="space-y-6">
          {result?.quizzes.map((q, idx) => (
            <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Question {idx + 1}</span>
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 rounded-full">{q.type}</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-4 leading-relaxed">
                {q.question}
              </p>

              {q.type === 'multipleChoice' || q.type === 'grammar' || q.type === 'reading' ? (
                <div className="space-y-2">
                  {q.options?.map((opt, i) => (
                    <button
                      key={i}
                      disabled={submitted}
                      onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                      className={`w-full text-left p-3 rounded-xl text-xs transition-all border ${
                        answers[q.id] === opt 
                        ? (submitted ? (opt === q.answer ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500') : 'bg-blue-50 border-blue-500')
                        : 'bg-gray-50 border-transparent hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {submitted && opt === q.answer && <CheckCircle2 size={14} className="text-green-500" />}
                        {submitted && answers[q.id] === opt && opt !== q.answer && <XCircle size={14} className="text-red-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              ) : q.type === 'spelling' ? (
                <div className="space-y-2">
                   <input 
                    type="text"
                    disabled={submitted}
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    placeholder="Type word..."
                    className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${
                      submitted 
                      ? (answers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim() ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500')
                      : 'bg-gray-50 focus:bg-white focus:border-blue-400'
                    }`}
                  />
                  {submitted && answers[q.id]?.toLowerCase().trim() !== q.answer.toLowerCase().trim() && (
                    <p className="text-[10px] text-green-600 font-bold">Correct: {q.answer}</p>
                  )}
                </div>
              ) : null}

              {submitted && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 italic">
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {!submitted && (
          <button 
            onClick={handleSubmit}
            className="w-full mt-10 bg-black text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
          >
            Submit Quiz
          </button>
        )}
      </div>
    );
  };

  return (
    <iPhoneContainer>
      {/* Dynamic Header */}
      <div className="flex justify-between items-center px-6 py-2 mb-4">
        <span className="text-sm font-bold">9:41</span>
        <div className="flex gap-1.5 items-center">
          <div className="w-4 h-2 bg-black rounded-sm" />
          <div className="w-1 h-1 bg-black rounded-full" />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="h-full">
        {!result && renderScanView()}
        {result && activeTab === 'scan' && renderScanView()}
        {result && activeTab === 'notes' && renderNotesView()}
        {result && activeTab === 'mindmap' && renderMindMapView()}
        {result && activeTab === 'practice' && renderPracticeView()}
      </main>

      {/* Tab Bar */}
      <div className="absolute bottom-0 w-full h-20 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-around px-6 pb-2">
        <TabButton 
          active={activeTab === 'scan'} 
          icon={<Camera size={22} />} 
          label="Scan" 
          onClick={() => setActiveTab('scan')} 
        />
        <TabButton 
          active={activeTab === 'notes'} 
          icon={<Book size={22} />} 
          label="Notes" 
          onClick={() => setActiveTab('notes')} 
        />
        <TabButton 
          active={activeTab === 'mindmap'} 
          icon={<Brain size={22} />} 
          label="Mind Map" 
          onClick={() => setActiveTab('mindmap')} 
        />
        <TabButton 
          active={activeTab === 'practice'} 
          icon={<HelpCircle size={22} />} 
          label="Practice" 
          onClick={() => setActiveTab('practice')} 
        />
      </div>
    </iPhoneContainer>
  );
};

export default App;
