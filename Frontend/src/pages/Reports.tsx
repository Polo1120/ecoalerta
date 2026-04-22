import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { getReports, type ReportPublic } from '../api/reportService';
import Header from '../components/Header';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'in_progress':
      return { text: 'En proceso', style: 'bg-blue-100 text-blue-600' };
    case 'resolved':
      return { text: 'Completado', style: 'bg-green-100 text-green-700' };
    case 'pending':
    default:
      return { text: 'Pendiente', style: 'bg-yellow-100 text-yellow-700' };
  }
};

export default function Reports() {
  const logout = useAuthStore(state => state.logout);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports', statusFilter],
    queryFn: () => getReports(1, 20, statusFilter)
  });

  const reportsList = data?.results || [];

  return (
    <div className="min-h-screen bg-(--bg-color-body) pb-24 lg:pb-0">
      <Header
        title="Mis Reportes"
        alignLeft={true}
        rightElement={
          <button
            onClick={logout}
            className="bg-gray-200 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-300 transition-colors"
            title="Cerrar sesión"
          >
            <i className="icon-user text-xl text-(--primary)"></i>
          </button>
        }
      />
      <div className="layout-container">
        <div className="px-4 md:px-6 py-4">

          <div className="mb-6 space-y-4">

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="icon-lupa text-xl"></span>
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full bg-white border border-gray-100 rounded-[12px] py-3.5 pl-12 pr-4 shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-(--primary)"
              />
            </div>


            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setStatusFilter('')}
                className={`whitespace-nowrap px-6 py-2 rounded-full font-medium shadow-sm transition-colors border ${statusFilter === '' ? 'bg-(--primary) text-white border-(--primary)' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'} cursor-pointer`}>
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`whitespace-nowrap px-6 py-2 rounded-full font-medium shadow-sm transition-colors border ${statusFilter === 'in_progress' ? 'bg-(--primary) text-white border-(--primary)' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'} cursor-pointer`}>
                En proceso
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`whitespace-nowrap px-6 py-2 rounded-full font-medium shadow-sm transition-colors border ${statusFilter === 'resolved' ? 'bg-(--primary) text-white border-(--primary)' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'} cursor-pointer`}>
                Completados
              </button>
            </div>
          </div>


          <div className="max-lg:space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6 pb-20">
            {isLoading && (
              <div className="text-center py-10 text-gray-500 lg:col-span-full">
                Cargando reportes...
              </div>
            )}

            {isError && (
              <div className="text-center py-10 text-red-500 lg:col-span-full">
                Error al consultar los reportes. Inténtalo más tarde.
              </div>
            )}

            {!isLoading && !isError && reportsList.length === 0 && (
              <div className="text-center py-10 text-gray-400 lg:col-span-full">
                No tienes reportes para mostrar.
              </div>
            )}

            {!isLoading && !isError && reportsList.map((report: ReportPublic) => {
              const badge = getStatusBadge(report.status);
              const formattedDate = new Date(report.created_at).toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric'
              });

              return (
                <div key={report.id} className="bg-white rounded-[12px] p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="text-[17px] font-bold text-gray-800 leading-tight">
                      {report.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badge.style}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div className="space-y-1 mb-5">
                    <p className="text-[14px] text-gray-500 truncate" title={`${report.latitude}, ${report.longitude}`}>
                      Ubicación: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                    </p>
                    <p className="text-[14px] text-gray-500">
                      Fecha: {formattedDate}
                    </p>
                  </div>

                  <Link
                    to={`/reports/${report.id}`}
                    className="w-full bg-(--secondary) text-white font-semibold py-2.5 rounded-[8px] flex items-center justify-center"
                  >
                    Ver detalle
                  </Link>
                </div>
              )
            })}
          </div>


          <Link
            to="/create-report"
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 xl:right-16 w-14 h-14 bg-(--primary) text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-800 transition-colors z-50"
          >
            <span className="icon-icon-sum text-2xl"></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
