document.addEventListener("DOMContentLoaded", async function() {
  const jsonFileName = 'https://munreden.github.io/comunidadGamePassES/releasesCalendar/data.json'; 

  try {
    const gamesData = await readJson(jsonFileName);
    const releaseGames = gamesData.releaseGames;
    const leavingGames = gamesData.leavingGames;
    const freePlayDaysGames = gamesData.freePlayDays; // Modificado aquí

    const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    let displayedMonth = currentMonth;
    let displayedYear = currentYear;

    // Máximo de 6 meses adelante
    const maxMonth = (currentMonth + 6) % 12;
    const maxYear = currentYear + Math.floor((currentMonth + 6) / 12);

    // Inicializar calendario
    initializeCalendar(displayedYear, displayedMonth);

    // Botones de navegación
    document.getElementById("prevMonth").addEventListener("click", function() {
      if (canNavigatePrev()) {
        displayedMonth--;
        if (displayedMonth < 0) {
          displayedMonth = 11;
          displayedYear--;
        }
        initializeCalendar(displayedYear, displayedMonth);
      }
    });

    document.getElementById("nextMonth").addEventListener("click", function() {
      if (canNavigateNext()) {
        displayedMonth++;
        if (displayedMonth > 11) {
          displayedMonth = 0;
          displayedYear++;
        }
        initializeCalendar(displayedYear, displayedMonth);
      }
    });

    function canNavigatePrev() {
      return !(displayedYear === currentYear && displayedMonth === currentMonth);
    }

    function canNavigateNext() {
      return !(displayedYear === maxYear && displayedMonth === maxMonth);
    }

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

      // Después de renderizar el calendario, inicializamos el modal
      initializeModal(releaseGames, leavingGames, freePlayDaysGames, monthNames);

      // Actualizar botones de navegación
      updateNavigationButtons();
    }

    function updateNavigationButtons() {
      document.getElementById("prevMonth").disabled = !canNavigatePrev();
      document.getElementById("nextMonth").disabled = !canNavigateNext();
    }

    function generateWeekDaysHTML() {
      let html = '<div class="week-row">';
      weekDays.forEach(day => {
        html += `<span class="week-columns">${day}</span>`;
      });
      html += '</div>';
      return html;
    }

    function generateDayHTML(day, formattedDate, adjustedFirstDay) {
      const gamesForThisDay = releaseGames.filter(game => game.date === formattedDate);
      const gamesLeavingThisDay = leavingGames.filter(game => game.date === formattedDate);
      const freePlayDaysForThisDay = freePlayDaysGames.filter(game => game.date === formattedDate);

      const isToday = displayedYear === currentYear && displayedMonth === currentMonth && day === currentDate.getDate();
    
      let dayContent = `<span class="${isToday ? 'day-active' : 'day'}" data-date="${formattedDate}">${day}`;
    
      if (gamesForThisDay.length > 0 || gamesLeavingThisDay.length > 0 || freePlayDaysForThisDay.length > 0) {
        dayContent += generateBadgeHTML(gamesForThisDay, gamesLeavingThisDay, freePlayDaysForThisDay);
      }
    
      dayContent += `</span>`;
    
      if ((day + adjustedFirstDay) % 7 === 0) {
        dayContent += `</div><div class="week-row">`;
      }
      return dayContent;
    }

    function generateBadgeHTML(gamesForThisDay, gamesLeavingThisDay, freePlayDaysForThisDay) {
      return `
        <span class="new-games-badge"></span>
        <div>
          <span class="new-games-title">
            ${gamesForThisDay.length > 0 ? `<div><i class="bi bi-patch-plus"></i>${gamesForThisDay.length}</div>` : ''}
            ${gamesLeavingThisDay.length > 0 ? `<div><i class="bi bi-patch-minus"></i>${gamesLeavingThisDay.length}</div>` : ''}
            ${freePlayDaysForThisDay.length > 0 ? (gamesForThisDay.length > 0 || gamesLeavingThisDay.length > 0 ? ' ' : '') + '<div><span class="xfpd"><i class="bi bi-xbox"></i> FREE PLAY DAYS</span></div>' : ''}
          </span>
        </div>`;
    }    

    function completeLastWeek(totalDays) {
      const remainingSpaces = (7 - (totalDays % 7)) % 7;
      let html = '';
      for (let i = 0; i < remainingSpaces; i++) {
        html += `<span class="day">-</span>`;
      }
      return html;
    }

    function initializeModal(releaseGames, leavingGames, freePlayDaysGames, monthNames) {
      const modal = document.getElementById("gameModal");
      const modalBody = document.getElementById("modal-body");
      const modalTitle = document.getElementById("modal-title");
    
      document.querySelectorAll(".day, .day-active").forEach(day => {
        day.addEventListener("click", function() {
          const date = this.getAttribute("data-date");
          const gamesForThisDay = releaseGames.filter(game => game.date === date);
          const gamesLeavingThisDay = leavingGames.filter(game => game.date === date);
          const freePlayDaysForThisDay = freePlayDaysGames.filter(game => game.date === date);
    
          if (gamesForThisDay.length > 0 || gamesLeavingThisDay.length > 0 || freePlayDaysForThisDay.length > 0) {
            const formattedDate = formatDateForModal(date, monthNames);
            modalTitle.textContent = `Juegos del ${formattedDate}`.toUpperCase();
    
            let modalContent = '<div class="games-container">';
            if (gamesForThisDay.length > 0) {
              modalContent += `<h3>ENTRAN <i class="bi bi-patch-plus"></i></h3>${generateGamesEntry(gamesForThisDay)}`;
            }
            if (gamesLeavingThisDay.length > 0) {
              modalContent += `<h3>SALEN <i class="bi bi-patch-minus"></i></h3>${generateGamesEntry(gamesLeavingThisDay)}`;
            }
            if (freePlayDaysForThisDay.length > 0) {
              const freePlayDateLeaving = freePlayDaysForThisDay[0].dateLeaving;
              const formattedFreePlayDate = new Date(freePlayDateLeaving).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
              modalContent += `<h3>XBOX FREE PLAY DAYS (hasta ${formattedFreePlayDate})</h3>${generateGamesEntry(freePlayDaysForThisDay)}`;
            }
            modalContent += '</div>';
    
            modalBody.innerHTML = modalContent;
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
          }
        });
      });
    }
    
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

    function formatDateForModal(date, monthNames) {
      const dateObj = new Date(date);
      return `${dateObj.getDate()} de ${monthNames[dateObj.getMonth()]}`;
    }

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