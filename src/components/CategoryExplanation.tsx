import { Info } from 'lucide-react';

export default function CategoryExplanation() {
  return (
    <div className="bg-stone-100 border border-stone-200 rounded-xl p-4 flex gap-3">
      <Info size={18} className="text-stone-400 shrink-0 mt-0.5" />
      <div className="text-xs text-stone-600 leading-relaxed">
        <div className="font-semibold text-stone-700 mb-1.5">How are categories decided?</div>
        <p className="mb-2">
          Categories are based on which alliance won each constituency across all 6 elections
          (Assembly 2011, 2016, 2021 + Lok Sabha 2014, 2019, 2024):
        </p>
        <ul className="space-y-1 mb-2">
          <li><strong>Bastion</strong> — Same alliance won all 6 out of 6 elections</li>
          <li><strong>Strong</strong> — Same alliance won 5 out of 6 elections</li>
          <li><strong>Leaning</strong> — Same alliance won 4 out of 6 elections</li>
          <li><strong>Swinging</strong> — No single alliance won more than 3 elections</li>
        </ul>
        <p>
          The alliance name (UDF/LDF/NDA) before the category tells you which alliance dominates that seat.
        </p>
      </div>
    </div>
  );
}
