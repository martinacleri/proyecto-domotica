/* ClassroomList.jsx */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EventDetails from './EventDetails';
import './Classrooms.css';

const ClassroomList = () => {
    const [classrooms, setClassrooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClassrooms = async () => {
            const response = await axios.get('http://localhost:3000/api/classrooms/getClassroom');
            setClassrooms(response.data);
        };

        fetchClassrooms();
    }, []);

    const handleClassroomClick = (classroomId) => {
        // Guarda el ID en el localStorage
        localStorage.setItem('selectedClassroomId', classroomId);
        navigate('/control-panel');
    };

    return (
        <div className="classroom-list-container">
            <h1 className="classroom-list-title">Aulas 4to nivel</h1>
            <ul className="classroom-list">
                {classrooms.map((classroom) => (
                    <li key={classroom.id} className="classroom-item">
                        <p className="classroom-name">{classroom.name}</p>
                        <EventDetails classroomId={classroom.id} />
                        <button 
                            onClick={() => handleClassroomClick(classroom.id)} 
                            className="classroom-button"
                        >
                            Ir a panel de control
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ClassroomList;