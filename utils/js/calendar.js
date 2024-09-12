document.addEventListener("DOMContentLoaded", async function() {
  const jsonFileName = 'https://munreden.github.io/comunidadGamePassES/releasesCalendar/data.json'; 

  try {
    const gamesData = await readJson(jsonFileName);
    const releaseGames = gamesData.releaseGames;
    const leavingGames = gamesData.leavingGames;

    const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Inicializar calendario
    initializeCalendar(currentYear, currentMonth);

    // Lógica del modal
    initializeModal(releaseGames, leavingGames, monthNames);

    /**
     * Inicializa el calendario para el año y mes actuales.
     * @param {number} year - Año actual.
     * @param {number} month - Mes actual (0-indexado).
     */
    function initializeCalendar(year, month) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

      document.getElementById("currentMonth").textContent = `${monthNames[month]} ${year}`;

      let calendarHTML = generateWeekDaysHTML();

      // Añadir los días vacíos hasta el primer día del mes
      calendarHTML += '<div class="week-row">';
      for (let i = 0; i < adjustedFirstDay; i++) {
        calendarHTML += `<span class="day">-</span>`;
      }

      // Crear los días del mes
      for (let i = 1; i <= daysInMonth; i++) {
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        calendarHTML += generateDayHTML(i, formattedDate, adjustedFirstDay);
      }

      // Completar la última semana del mes
      const totalDays = daysInMonth + adjustedFirstDay;
      calendarHTML += completeLastWeek(totalDays);
      calendarHTML += '</div>';

      document.getElementById("calendarDays").innerHTML = calendarHTML;
    }

    /**
     * Genera el HTML para los días de la semana.
     */
    function generateWeekDaysHTML() {
      let html = '<div class="week-row">';
      weekDays.forEach(day => {
        html += `<span class="week-columns">${day}</span>`;
      });
      html += '</div>';
      return html;
    }

    /**
     * Genera el HTML de un día específico en el calendario.
     * @param {number} day - Día del mes.
     * @param {string} formattedDate - Fecha formateada en "YYYY-MM-DD".
     * @param {number} adjustedFirstDay - Ajuste para el primer día del mes.
     */
    function generateDayHTML(day, formattedDate, adjustedFirstDay) {
      const gamesForThisDay = releaseGames.filter(game => game.date === formattedDate);
      const gamesLeavingThisDay = leavingGames.filter(game => game.date === formattedDate);
      let dayContent = `<span class="${day === currentDay ? 'day-active' : 'day'}" data-date="${formattedDate}">${day}`;

      if (gamesForThisDay.length > 0 || gamesLeavingThisDay.length > 0) {
        dayContent += generateBadgeHTML(gamesForThisDay, gamesLeavingThisDay);
      }

      dayContent += `</span>`;

      if ((day + adjustedFirstDay) % 7 === 0) {
        dayContent += `</div><div class="week-row">`;
      }
      return dayContent;
    }

    /**
     * Genera la insignia con los detalles de los juegos entrantes o salientes.
     */
    function generateBadgeHTML(gamesForThisDay, gamesLeavingThisDay) {
      return `
        <span class="new-games-badge"></span>
        <div>
          <span class="new-games-title">
            ${gamesForThisDay.length > 0 ? `${gamesForThisDay.length} ${gamesForThisDay.length > 1 ? 'juegos entran' : 'juego entra'}` : ''}
            ${gamesForThisDay.length > 0 && gamesLeavingThisDay.length > 0 ? ', ' : ''}
            ${gamesLeavingThisDay.length > 0 ? `${gamesLeavingThisDay.length > 1 ? 'juegos salen' : 'juego sale'}` : ''}
          </span>
        </div>`;
    }

    /**
     * Completa la última fila de la semana en el calendario con espacios vacíos.
     */
    function completeLastWeek(totalDays) {
      const remainingSpaces = (7 - (totalDays % 7)) % 7;
      let html = '';
      for (let i = 0; i < remainingSpaces; i++) {
        html += `<span class="day">-</span>`;
      }
      return html;
    }

    /**
     * Inicializa el modal con los juegos correspondientes al día seleccionado.
     */
    function initializeModal(releaseGames, leavingGames, monthNames) {
      const modal = document.getElementById("gameModal");
      const modalBody = document.getElementById("modal-body");
      const modalTitle = document.getElementById("modal-title");

      document.querySelectorAll(".day, .day-active").forEach(day => {
        day.addEventListener("click", function() {
          const date = this.getAttribute("data-date");
          const gamesForThisDay = releaseGames.filter(game => game.date === date);
          const gamesLeavingThisDay = leavingGames.filter(game => game.date === date);

          if (gamesForThisDay.length > 0 || gamesLeavingThisDay.length > 0) {
            const formattedDate = formatDateForModal(date, monthNames);
            modalTitle.textContent = `Lanzamientos del ${formattedDate}`.toUpperCase();

            let modalContent = '<div class="games-container">';
            if (gamesForThisDay.length > 0) {
              modalContent += `<h3>ENTRAN</h3>${generateGamesEntry(gamesForThisDay)}`;
            }
            if (gamesLeavingThisDay.length > 0) {
              modalContent += `<h3>SALEN</h3>${generateGamesEntry(gamesLeavingThisDay)}`;
            }
            modalContent += '</div>';

            modalBody.innerHTML = modalContent;
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
          }
        });
      });
    }

    /**
     * Genera el HTML para las entradas de juegos en el modal.
     */
    function generateGamesEntry(games) {
      return `
        <div class="games-entry">
          ${games.map(game => `
            <div class="game-entry">
              <a href="${game.url}" target="_blank">
                ${generatePlatformsIcons(game.platforms)}
                <img class="cover" src="${game.cover}" alt="${game.name}">
                <p class="game-name">${game.name}</p>
              </a>
            </div>
          `).join('')}
        </div>`;
    }

    /**
     * Genera el HTML para las plataformas de juegos en el modal.
     */
    function generatePlatformsIcons(platforms) {
      let platformsHTML = '<div class="platforms">';

      if (platforms.includes("xbox")) {
        platformsHTML += `<i class="bi bi-xbox"></i>`;
      }

      if (platforms.includes("cloud")) {
        platformsHTML += `<i class="bi bi-cloud-fill"></i>`;
      }

      if (platforms.includes("pc")) {
        platformsHTML += `<i class="bi bi-pc-display"></i>`;
      }

      platformsHTML += '</div>';
      return platformsHTML;
    }

    /**
     * Formatea la fecha para mostrar en el modal.
     */
    function formatDateForModal(date, monthNames) {
      const dateObj = new Date(date);
      return `${dateObj.getDate()} de ${monthNames[dateObj.getMonth()]}`;
    }

    /**
     * Lee el archivo JSON con los juegos a modo de DB.
     */
    async function readJson(jsonFileName) {
      try {
        const response = await fetch(jsonFileName);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return await response.json();
      } catch (error) {
        console.error('There was a problem during the request:', error);
      }
    }
  } catch (error) {
    console.error('Error while processing JSON data:', error);
  }
});