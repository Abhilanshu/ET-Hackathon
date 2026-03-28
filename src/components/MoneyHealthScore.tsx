import { useState } from 'react';
import './MoneyHealthScore.css';
import { ArrowRight } from 'lucide-react';

const questions = [
  {
    id: 'emergency',
    title: 'Emergency Preparedness',
    question: 'How many months of expenses can your emergency fund cover?',
    options: [
      { label: 'Less than 1 month', score: 0 },
      { label: '1-3 months', score: 5 },
      { label: '3-6 months', score: 10 },
      { label: '6+ months', score: 15 }
    ]
  },
  {
    id: 'insurance',
    title: 'Insurance Coverage',
    question: 'Do you have term life and health insurance independent of your employer?',
    options: [
      { label: 'None', score: 0 },
      { label: 'Only Employer provided', score: 5 },
      { label: 'Only Health OR Term', score: 10 },
      { label: 'Both Health and Term', score: 15 }
    ]
  },
  {
    id: 'diversification',
    title: 'Investment Diversification',
    question: 'Where is the majority of your wealth parked?',
    options: [
      { label: 'Savings Account / Cash', score: 2 },
      { label: 'Fixed Deposits', score: 5 },
      { label: 'Real Estate / Gold only', score: 8 },
      { label: 'Diversified (Equity, Debt, Gold)', score: 15 }
    ]
  },
  {
    id: 'debt',
    title: 'Debt Health',
    question: 'How much of your monthly income goes toward EMIs (excluding home loan)?',
    options: [
      { label: 'More than 40%', score: 0 },
      { label: '20% to 40%', score: 5 },
      { label: '1% to 20%', score: 10 },
      { label: '0%', score: 15 }
    ]
  },
  {
    id: 'tax',
    title: 'Tax Efficiency',
    question: 'How do you plan your tax saving investments?',
    options: [
      { label: 'I don’t plan tracking', score: 0 },
      { label: 'Rush in March', score: 5 },
      { label: 'Through ongoing SIPs', score: 15 }
    ]
  },
  {
    id: 'retirement',
    title: 'Retirement Readiness',
    question: 'Have you calculated your retirement corpus and started investing for it?',
    options: [
      { label: 'No, will think later', score: 0 },
      { label: 'Started saving generally', score: 8 },
      { label: 'Yes, with a clear corpus goal', score: 25 }
    ]
  }
];

export const MoneyHealthScore = ({ onComplete }: { onComplete: (score: number, max: number) => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [animatingOut, setAnimatingOut] = useState(false);

  const handleSelect = (score: number) => {
    setScores(prev => ({ ...prev, [questions[currentStep].id]: score }));
    
    if (currentStep < questions.length - 1) {
      setAnimatingOut(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setAnimatingOut(false);
      }, 300);
    } else {
      // Calculate final score
      const totalScore = Object.values({ ...scores, [questions[currentStep].id]: score }).reduce((a, b) => a + b, 0);
      onComplete(totalScore, 100);
    }
  };

  const q = questions[currentStep];

  return (
    <div className="health-score-wizard glass-panel animate-fade-in-up">
      <div className="wizard-header">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / questions.length) * 100}%` }}
          />
        </div>
        <span className="step-indicator">Step {currentStep + 1} of {questions.length}</span>
      </div>

      <div className={`wizard-body ${animatingOut ? 'slide-out' : 'slide-in'}`}>
        <h4 className="category-title text-gradient-primary">{q.title}</h4>
        <h2 className="question-text">{q.question}</h2>
        
        <div className="options-grid">
          {q.options.map((opt, idx) => (
            <button 
              key={idx} 
              className="option-btn"
              onClick={() => handleSelect(opt.score)}
            >
              <div className="option-inner">
                {opt.label}
              </div>
              <ArrowRight className="arrow-icon" size={18} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
