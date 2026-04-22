import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReport, type ReportCreate } from '../api/reportService';
import EcoMap from '../components/Map';
import Header from '../components/Header';

export default function CreateReport() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [residueType, setResidueType] = useState('common');
  const [localError, setLocalError] = useState('');

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (newReport: ReportCreate) => createReport(newReport),
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['reports'] });
      navigate('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (title.trim().length < 5) {
      setLocalError('El título debe tener al menos 5 caracteres.');
      return;
    }

    if (title.trim().length > 200) {
      setLocalError('El título no puede exceder los 200 caracteres.');
      return;
    }

    if (description.trim().length < 10) {
      setLocalError('La descripción debe tener al menos 10 caracteres.');
      return;
    }

    mutate({
      title: title.trim(),
      description: description.trim(),
      latitude: 4.6097,
      longitude: -74.0817,
      image_url: "file:///C:/Users/Edgardo/Pictures/26f69992149c5f07ee855da5ac54509f.png",
    });
  };

  const errorMessage = localError || (isError ? "Ocurrió un error al enviar el reporte. Por favor revisa los datos e intenta de nuevo." : "");

  return (
    <div className="min-h-screen bg-(--bg-color-body) pb-24 lg:pb-0">
      <Header title="Crear Reporte" showBack={true} />

      <div className="layout-container">
        <form onSubmit={handleSubmit} className="space-y-4 px-4 md:px-6 py-4 lg:grid lg:grid-cols-[minmax(400px,_45%)_1fr] lg:gap-8 lg:space-y-0 lg:items-start">

          <div className="space-y-4">
            <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">

              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título del reporte
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Basura en el parque"
                  className="w-full input-primary outline-none focus:ring-2 focus:ring-(--primary)/50"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del problema
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalla el problema que encontraste..."
                  rows={4}
                  className="w-full input-primary outline-none focus:ring-2 focus:ring-(--primary)/50 resize-none"
                />
              </div>

              <div className="mb-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de residuo
                </label>
                <div className="relative">
                  <select
                    id="type"
                    value={residueType}
                    onChange={(e) => setResidueType(e.target.value)}
                    className="w-full input-primary appearance-none outline-none focus:ring-2 focus:ring-(--primary)/50 bg-white"
                  >
                    <option value="common">Basura común</option>
                    <option value="plastic">Plásticos</option>
                    <option value="electronic">Electrónicos</option>
                    <option value="organic">Orgánico</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-(--secondary)">
                    <span className="icon-arrow-down text-sm"></span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button type="button" className="w-full py-3.5 border-2 border-dashed border-(--secondary) bg-(--secondary)/10 text-(--primary) rounded-[12px] flex items-center justify-center font-medium font-bold hover:bg-(--secondary)/20 transition-colors">
                  <span className="icon-photo text-lg mr-2"></span>
                  Adjuntar foto
                </button>
              </div>

            </div>
          </div>


          <div className="space-y-4">

            <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 h-full flex flex-col">
              <h2 className="text-sm text-gray-700 mb-3">
                Ubicación del incidente
              </h2>

              <div className="w-full h-full flex-grow relative rounded-xl overflow-hidden bg-gray-100">
                <EcoMap zoom={14} heightClass="min-h-[220px] lg:min-h-[calc(100vh-350px)]" />


              </div>
            </div>


            <div className="pt-4 pb-6">
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl text-sm border border-red-100 font-medium">
                  {errorMessage}
                </div>
              )}
              <button
                type="submit"
                disabled={isPending}
                className={`w-full flex items-center justify-center btn-primary bg-(--primary) hover:bg-green-800 text-white font-bold h-[56px] text-lg rounded-[12px] shadow-md transition-colors ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isPending ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Enviar Reporte"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
