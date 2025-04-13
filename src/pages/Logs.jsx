import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Ruta ajustada

import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
);



const processLogData = (snapshot) => {
  return snapshot.docs.map(doc => {
    const data = doc.data();
    let timestamp;
    
    if (data.timestamp?.toDate) {
      timestamp = data.timestamp.toDate();
    } else if (data.timestamp) {
      timestamp = new Date(data.timestamp);
    } else {
      timestamp = new Date();
    }
    
    return {
      ...data,
      timestamp: timestamp.toISOString(),
      logLevel: data.logLevel || 'info',
      responseTime: data.responseTime || 0,
      status: data.status || 200
    };
  });
};

const Logs = () => {
  const [server1Logs, setServer1Logs] = useState([]);
  const [server2Logs, setServer2Logs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();  

  useEffect(() => {
    const fetchAllLogs = async () => {
      try {
        setLoading(true);
        
        const [server1Query, server2Query] = [
          query(collection(db, 'logs'), where('server', '==', 'server1')),
          query(collection(db, 'logs2'), where('server', '==', 'server2'))
        ];
        
        const [server1Snapshot, server2Snapshot] = await Promise.all([
          getDocs(server1Query),
          getDocs(server2Query)
        ]);
        
        setServer1Logs(processLogData(server1Snapshot));
        setServer2Logs(processLogData(server2Snapshot));
        
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    
    
    fetchAllLogs();
  }, []);

    // Función para contar logs por nivel
    const countLogsByLevel = (logs) => {
        return {
            info: logs.filter(log => log.logLevel === 'info').length,
            warn: logs.filter(log => log.logLevel === 'warn').length,
            error: logs.filter(log => log.logLevel === 'error').length
        };
    };

    // Función para calcular el tiempo de respuesta promedio
    const calculateAvgResponseTime = (logs) => {
        if (logs.length === 0) return 0;
        const total = logs.reduce((sum, log) => sum + (log.responseTime || 0), 0);
        return Math.round(total / logs.length);
    };

    // Función para contar solicitudes exitosas/fallidas
    const countRequestStatus = (logs) => {
        return {
            success: logs.filter(log => log.status && log.status < 400).length,
            failed: logs.filter(log => log.status && log.status >= 400).length
        };
    };

    if (loading) {
        return <div className="loading">Cargando datos de logs...</div>;
    }

    // Datos para gráficas
    const levelsCount1 = countLogsByLevel(server1Logs);
    const levelsCount2 = countLogsByLevel(server2Logs);
    const avgResponse1 = calculateAvgResponseTime(server1Logs);
    const avgResponse2 = calculateAvgResponseTime(server2Logs);
    const requestStatus1 = countRequestStatus(server1Logs);
    const requestStatus2 = countRequestStatus(server2Logs);

    // Configuración de gráficas
    const logsLevelData = {
        labels: ['INFO', 'WARN', 'ERROR'],
        datasets: [
            {
                label: 'Servidor 1 (con Rate Limit)',
                data: [levelsCount1.info, levelsCount1.warn, levelsCount1.error],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'Servidor 2 (sin Rate Limit)',
                data: [levelsCount2.info, levelsCount2.warn, levelsCount2.error],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }
        ]
    };

    const responseTimeData = {
        labels: ['Servidor 1', 'Servidor 2'],
        datasets: [{
            label: 'Tiempo de respuesta promedio (ms)',
            data: [avgResponse1, avgResponse2],
            backgroundColor: [
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)'
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
        }]
    };

    const requestStatusData = {
        labels: ['Exitosas', 'Fallidas'],
        datasets: [
            {
                label: 'Servidor 1',
                data: [requestStatus1.success, requestStatus1.failed],
                backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            },
            {
                label: 'Servidor 2',
                data: [requestStatus2.success, requestStatus2.failed],
                backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }
        ]
    };

    // Opciones comunes para las gráficas
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Análisis de Logs',
                font: {
                    size: 16
                }
            },
        },
        maintainAspectRatio: false,
        height: 400
    };

    
    

    return (
      
        <div className="logs-container">
            <h1>Dashboard de Logs</h1>

            <button
                style={{ marginBottom: "20px" }}
                onClick={() => navigate("/home")}
            >
                Regresar al HOme
            </button>

            
            <div className="chart-container">
                <h2>Niveles de Log por Servidor</h2>
                <div style={{ height: '400px' }}>
                    <Bar data={logsLevelData} options={chartOptions} />
                </div>
            </div>

            <div className="chart-container">
                <h2>Tiempos de Respuesta Promedio</h2>
                <div style={{ height: '400px' }}>
                    <Bar data={responseTimeData} options={chartOptions} />
                </div>
            </div>

            <div className="chart-container">
                <h2>Estado de las Peticiones</h2>
                <div style={{ height: '400px', width: '50%', margin: '0 auto' }}>
                    <Pie data={requestStatusData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
};

export default Logs;