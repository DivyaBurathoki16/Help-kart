import Card from '../../ui/Card';
import ServiceCard from './ServiceCard';

const StaticServicesForm = ({ formData, updateArrayField, addArrayItem, removeArrayItem }) => {
  const services = formData.services || [];

  return (
    <div className="space-y-6">
      <Card className="p-6 border-2 border-blue-100 dark:border-blue-900/30">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Static Services</h3>
            <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
              Manage your service listings
            </p>
          </div>
          <button
            onClick={() => addArrayItem('services', { title: '', description: '', price: 0, category: '', images: [] })}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            + Add Service
          </button>
        </div>
      </Card>
      
      {services.length === 0 ? (
        <Card className="p-12 border-2 border-dashed border-slate-300 dark:border-neutral-700">
          <div className="text-center text-slate-500 dark:text-neutral-400">
            <p className="text-lg font-medium">No static services yet</p>
            <p className="text-sm mt-1">Click "Add Service" to create one.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {services.map((service, idx) => (
            <ServiceCard
              key={`service-${idx}`}
              service={service}
              index={idx}
              onUpdate={updateArrayField}
              onRemove={removeArrayItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StaticServicesForm;
