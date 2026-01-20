import { memo } from 'react';
import Card from '../../ui/Card';

const ServiceCard = memo(({ service, index, onUpdate, onRemove }) => {
  return (
    <Card className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-neutral-800/50 dark:to-neutral-800/30 border-2 border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-neutral-700">
        <h4 className="font-bold text-slate-900 dark:text-neutral-100 text-base">Service {index + 1}</h4>
        <button
          onClick={() => onRemove('services', index)}
          className="px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-semibold transition-colors"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={service.title || ''}
            onChange={(e) => onUpdate('services', index, 'title', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
            Category
          </label>
          <input
            type="text"
            value={service.category || ''}
            onChange={(e) => onUpdate('services', index, 'category', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
            Description
          </label>
          <textarea
            value={service.description || ''}
            onChange={(e) => onUpdate('services', index, 'description', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
            Price (₹)
          </label>
          <input
            type="number"
            value={service.price || ''}
            onChange={(e) => onUpdate('services', index, 'price', Number(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
            Image URL (first image)
          </label>
          <input
            type="text"
            value={service.images?.[0] || ''}
            onChange={(e) => {
              const images = service.images || [];
              const newImages = [...images];
              newImages[0] = e.target.value;
              onUpdate('services', index, 'images', newImages);
            }}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
            placeholder="https://..."
          />
        </div>
      </div>
    </Card>
  );
});

ServiceCard.displayName = 'ServiceCard';

export default ServiceCard;
