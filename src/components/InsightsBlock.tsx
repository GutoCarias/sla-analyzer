import { Lightbulb, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import { Insight } from '../types';

interface Props {
  insights: Insight[];
}

export default function InsightsBlock({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <div className="card-premium p-5 border-l-4 border-l-brand-blue bg-blue-50/10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-brand-blue" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Insights do Sistema</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Análise de Performance BI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, idx) => {
          const Icon = insight.type === 'success' ? CheckCircle2 : 
                       insight.type === 'error' ? XCircle : 
                       insight.type === 'warning' ? AlertTriangle : Lightbulb;
          
          const colorClass = insight.type === 'success' ? 'text-brand-green bg-brand-green/10' :
                             insight.type === 'error' ? 'text-brand-red bg-brand-red/10' :
                             insight.type === 'warning' ? 'text-brand-amber bg-brand-amber/10' : 'text-brand-blue bg-brand-blue/10';

          return (
            <div key={idx} className="flex gap-3 items-start group transition-all">
              <div className={`mt-0.5 p-1.5 rounded-md ${colorClass} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-700 leading-tight group-hover:text-brand-blue transition-colors">
                  {insight.message}
                </h4>
                {insight.description && (
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    {insight.description}
                  </p>
                )}
              </div>
              <ChevronRight className="w-3 h-3 text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
