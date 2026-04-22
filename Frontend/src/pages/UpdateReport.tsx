import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReportById, updateReportStatus } from '../api/reportService';
import Header from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';


const mockOperators = [
  { id: 'op1', name: 'Alcaldía Local', role: 'Gestión Ambiental' },
  { id: 'op2', name: 'Camión Recolector Z1', role: 'Operador Logístico' },
  { id: 'op3', name: 'Unidad de Mantenimiento', role: 'Ingeniería' }
];

export default function UpdateReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);


  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['report', id],
    queryFn: () => getReportById(id as string),
    enabled: !!id,
  });

  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>('pending');
  const [operator, setOperator] = useState<string>('');
  const [comment, setComment] = useState<string>('');

  const updateMutation = useMutation({
    mutationFn: (newStatus: string) => updateReportStatus(id as string, newStatus),
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['report', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });

      navigate(-1);
    },
    onError: (error) => {
      alert('Hubo un error al actualizar el reporte');
      console.error(error);
    }
  });

  useEffect(() => {
    if (report) {
      setStatus(report.status);
    }
  }, [report]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    updateMutation.mutate(status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--bg-color-body) flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--primary)"></div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="min-h-screen bg-(--bg-color-body) flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">Error al cargar el reporte para actualización.</p>
        <button onClick={() => navigate('/')} className="text-(--primary) font-semibold hover:underline">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-color-body) pb-24 lg:pb-0">
      <Header title="Gestión de Reporte" showBack={true} />

      <div className="layout-container">
        <div className="px-4 p-4 md:p-6 pb-[90px] lg:pb-8 lg:grid lg:grid-cols-[1fr_minmax(400px,_45%)] lg:gap-8 lg:items-start">


          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 ml-1">Contexto del ticket</h2>
            <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 opacity-90">
              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                {report.title}
              </h3>
              <p className="text-[14px] text-gray-600 mb-4 italic text-balance">"{report.description}"</p>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-(--primary)/10 text-(--primary) rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="icon-user text-lg"></span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Reportado por</p>
                  <p className="text-sm font-bold text-gray-800">{report.author ? `${report.author.first_name} ${report.author.last_name}` : 'Ciudadano'}</p>
                </div>
              </div>
            </div>

            {report.image_url && (
              <div className="bg-white rounded-[16px] p-2 shadow-sm border border-gray-100">
                <img
                  src={report.image_url}
                  alt="Evidencia"
                  className="h-[300px] w-full object-cover rounded-[12px]"
                />
              </div>
            )}
          </div>


          <div className="space-y-4 mt-6 lg:mt-0 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-800 ml-1">Panel de Control (Admin)</h2>
            <form onSubmit={handleSubmit} className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">

              <div className="mb-5">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del incidente
                </label>
                <div className="relative">
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full input-primary appearance-none outline-none focus:ring-2 focus:ring-(--primary)/50 bg-white font-medium"
                  >
                    <option value="pending">Pendiente (Sin asignar)</option>
                    <option value="in_progress">En proceso (Operativo)</option>
                    <option value="resolved">Completado</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-(--secondary)">
                    <span className="icon-arrow-down text-sm"></span>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="operator" className="block text-sm font-medium text-gray-700 mb-2">
                  Asignar Operador
                  <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Demo</span>
                </label>
                <div className="relative">
                  <select
                    id="operator"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full input-primary appearance-none outline-none focus:ring-2 focus:ring-(--primary)/50 bg-white"
                  >
                    <option value="">-- Seleccionar cuadrilla/agente --</option>
                    {mockOperators.map(op => (
                      <option key={op.id} value={op.id}>{op.name} ({op.role})</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-(--secondary)">
                    <span className="icon-arrow-down text-sm"></span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Anotaciones Internas (Opcional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Detalles sobre el envío o resolución..."
                  rows={4}
                  className="w-full input-primary outline-none focus:ring-2 focus:ring-(--primary)/50 resize-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className={`w-full py-4 btn-primary font-bold text-lg ${updateMutation.isPending ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-800'}`}
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando...
                  </span>
                ) : 'Guardar Actualización'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
