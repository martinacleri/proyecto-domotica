/* EventDetails.jsx */
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EventDetails = ({ classroomId }) => {
    const [event, setEvent] = useState(null);

    useEffect(() => {
        const fetchLatestEvent = async () => {
            const response = await axios.get(`http://localhost:3000/api/events/latestEvent/${classroomId}`);
            setEvent(response.data);
        };

        fetchLatestEvent();
    }, [classroomId]);

    const displayEventInfo = () => {
        if (!event) return "No hay últimos estados registrados para el aula.";

        const { mode, timestamp, user, scheduleEndTime } = event;

        if (event) {
            const formattedDate = new Date(timestamp).toLocaleString();
            return `El usuario ${user.firstName} ${user.surName} realizó el último cambio el ${formattedDate}.`;
        }

        return "No hay información disponible.";
    };

    return (
        <div>
            <h3>Detalles del último estado:</h3>
            <p>{displayEventInfo()}</p>
        </div>
    );
};

export default EventDetails;