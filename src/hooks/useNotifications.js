import { useCallback } from 'react';

export const useNotifications = () => {
  const solicitarPermisoNotificaciones = useCallback(async () => {
    if (!("Notification" in window)) {
      alert("Este navegador no soporta notificaciones");
      return false;
    }

    if (Notification.permission === "granted") {
      alert("¡Las notificaciones ya están activadas!");
      return true;
    }

    if (Notification.permission === "denied") {
      alert("Has bloqueado las notificaciones. Por favor, habilítalas manualmente en la configuración de tu navegador.");
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      alert("¡Notificaciones activadas! Ahora recibirás alertas cuando interactúes con Pokémon.");
      return true;
    } else {
      alert("Las notificaciones fueron denegadas. No recibirás alertas.");
      return false;
    }
  }, []);

  const enviarNotificacion = useCallback(async (titulo = "Pokédex actualizada", cuerpo = "¡Nuevo Pokémon encontrado!", icono = null) => {
    // Verificar si tenemos permiso
    if (Notification.permission !== "granted") {
      console.log("No hay permiso para notificaciones");
      return false;
    }

    // Verificar si el Service Worker está disponible
    if (!("serviceWorker" in navigator)) {
      console.log("Service Worker no disponible");
      // Fallback: usar Notifications API directamente
      try {
        new Notification(titulo, {
          body: cuerpo,
          icon: icono || "/logo192.png"
        });
        return true;
      } catch (error) {
        console.error("Error mostrando notificación:", error);
        return false;
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      registration.active.postMessage({
        type: "SHOW_NOTIFICATION",
        title: titulo,
        body: cuerpo,
        icon: icono
      });
      return true;
    } catch (error) {
      console.error("Error enviando notificación al Service Worker:", error);
      return false;
    }
  }, []);

  return {
    solicitarPermisoNotificaciones,
    enviarNotificacion
  };
};