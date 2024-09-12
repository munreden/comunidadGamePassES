window.onload = function() {
    if (localStorage.getItem("gameData")) {
      const storedData = JSON.parse(localStorage.getItem("gameData"));
      document.getElementById("jsonOutput").textContent = JSON.stringify(storedData, null, 2);
    }
  
    // Si el usuario intenta recargar la página, mostramos una alerta si hay datos en localStorage
    window.addEventListener("beforeunload", function(event) {
      if (localStorage.getItem("gameData")) {
        event.preventDefault();
        event.returnValue = ''; // Este valor hace que aparezca la alerta
      }
    });
  };
  
  // Escuchar el envío del formulario
  document.getElementById("gameForm").addEventListener("submit", function(event) {
    event.preventDefault();
  
    // Obtener los valores del formulario
    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const url = document.getElementById("url").value;
    const cover = document.getElementById("cover").value;
  
    // Obtener plataformas seleccionadas (revisar los checkboxes que tienen "name=platforms")
    const platforms = [];
    document.querySelectorAll('input[name="platforms"]:checked').forEach((checkbox) => {
      platforms.push(checkbox.value);
    });
  
    // Obtener el tipo de juego (release o leaving)
    const type = document.getElementById("type").value;
  
    // Crear el objeto para el juego
    const gameData = {
      name: name,
      date: date,
      url: url,
      cover: cover,
      platforms: platforms
    };
  
    // Recuperar los datos existentes de localStorage o inicializar uno vacío
    let storedData = JSON.parse(localStorage.getItem("gameData")) || {
      releaseGames: [],
      leavingGames: []
    };
  
    // Añadir el juego al array correspondiente dependiendo del tipo
    if (type === "release") {
      storedData.releaseGames.push(gameData);
    } else if (type === "leaving") {
      storedData.leavingGames.push(gameData);
    }
  
    // Guardar los datos actualizados en localStorage
    localStorage.setItem("gameData", JSON.stringify(storedData));
  
    // Mostrar el JSON generado en el <pre> con id="jsonOutput"
    document.getElementById("jsonOutput").textContent = JSON.stringify(storedData, null, 2);
  });
  
  // Función para limpiar localStorage
  function clearStorage() {
    localStorage.removeItem("gameData");
    document.getElementById("jsonOutput").textContent = ''; // Limpiar la salida en pantalla
  }  