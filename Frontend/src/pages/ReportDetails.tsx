import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getReportById } from '../api/reportService';
import EcoMap from '../components/Map';
import Header from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'in_progress':
      return { text: 'En proceso', style: 'bg-blue-100 text-blue-700' };
    case 'resolved':
      return { text: 'Completado', style: 'bg-green-100 text-green-700' };
    case 'pending':
    default:
      return { text: 'Pendiente', style: 'bg-yellow-100 text-yellow-700' };
  }
};

export default function ReportDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['report', id],
    queryFn: () => getReportById(id as string),
    enabled: !!id,
  });

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
        <p className="text-red-500 mb-4">Error al cargar los detalles del reporte.</p>
        <button
          onClick={() => navigate('/')}
          className="text-(--primary) font-semibold hover:underline"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const badge = getStatusBadge(report.status);


  const formattedDate = new Date(report.created_at).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="min-h-screen bg-(--bg-color-body) pb-24 lg:pb-0">
      <Header
        title="Detalles del Reporte"
        showBack={true}
        rightElement={
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'EcoAlerta - Reporte',
                  text: report.title,
                  url: window.location.href,
                });
              }
            }}
            className="p-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center h-10 w-10 flex-shrink-0"
          >
            <span className="icon-share text-xl"></span>
          </button>
        }
      />

      <div className="layout-container">
        <div className="px-4 p-4 md:p-6 pb-[90px] lg:pb-8 lg:grid lg:grid-cols-[1fr_minmax(400px,_45%)] lg:gap-8 lg:items-start">


          <div className="space-y-4">

            <div className="bg-white rounded-[16px] p-2 shadow-sm border border-gray-100 flex gap-2 overflow-x-auto scrollbar-hide">
              {report.image_url ? (
                <img
                  src={report.image_url}
                  alt="Evidencia del reporte"
                  className="h-48 w-full max-w-[280px] object-cover rounded-[12px] flex-shrink-0"
                />
              ) : (
                <div className="h-48 w-full bg-gray-100 rounded-[12px] flex items-center justify-center text-gray-400">
                  <span className="icon-photo text-3xl"></span>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                  Gestión de Residuos
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.style}`}>
                  {badge.text}
                </span>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                {report.title}
              </h2>

              <div className="space-y-3">
                <div className="flex items-start text-gray-600 gap-3">
                  <span className="icon-reloj text-lg mt-0.5"></span>
                  <span className="text-[15px]">{formattedDate}</span>
                </div>
                <div className="flex items-start text-gray-600 gap-3">
                  <span className="icon-ubication text-[19px]"></span>
                  <span className="text-[15px] max-w-[250px] leading-tight flex-1">
                    Ubicación: ({report.latitude.toFixed(4)}, {report.longitude.toFixed(4)})
                  </span>
                </div>
              </div>
            </div>


            <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Descripción
              </h3>
              <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line">
                {report.description}
              </p>
            </div>


            {user?.role === 'admin' && (
              <div className="hidden lg:block pt-4">
                <button
                  onClick={() => navigate(`/reports/${id}/update`)}
                  className="w-full btn-primary font-bold py-4 text-lg">
                  Asignar / Actualizar
                </button>
              </div>
            )}

          </div>


          <div className="space-y-4 mt-4 lg:mt-0 lg:sticky lg:top-24">

            <div className="w-full relative rounded-[16px] overflow-hidden bg-gray-100 shadow-sm border border-gray-100 h-full">
              <EcoMap
                center={[report.latitude, report.longitude]}
                zoom={15}
                heightClass="min-h-[180px] lg:min-h-[calc(100vh-240px)]"
              />
            </div>
          </div>
        </div>


        {user?.role === 'admin' && (
          <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white to-transparent md:bg-none z-10 lg:hidden">
            <div className="layout-container">
              <button
                onClick={() => navigate(`/reports/${id}/update`)}
                className="w-full btn-primary font-bold">
                Asignar / Actualizar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
