(function () {
  "use strict";

  var EVENT_DATE = new Date("2027-01-09T21:00:00-03:00").getTime();
  var units = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
  };
  var countdown = document.querySelector(".countdown");
  var finished = document.getElementById("countdownFinished");

  function twoDigits(value) {
    return String(value).padStart(2, "0");
  }

  function updateCountdown() {
    var distance = EVENT_DATE - Date.now();

    if (distance <= 0) {
      Object.keys(units).forEach(function (key) { units[key].textContent = "00"; });
      if (countdown) countdown.hidden = true;
      if (finished) finished.hidden = false;
      return false;
    }

    var day = 1000 * 60 * 60 * 24;
    var hour = 1000 * 60 * 60;
    var minute = 1000 * 60;

    units.days.textContent = twoDigits(Math.floor(distance / day));
    units.hours.textContent = twoDigits(Math.floor((distance % day) / hour));
    units.minutes.textContent = twoDigits(Math.floor((distance % hour) / minute));
    units.seconds.textContent = twoDigits(Math.floor((distance % minute) / 1000));
    return true;
  }

  if (updateCountdown()) {
    var countdownTimer = window.setInterval(function () {
      if (!updateCountdown()) window.clearInterval(countdownTimer);
    }, 1000);
  }

  var invitationAudio = document.getElementById("invitationAudio");
  var audioToggle = document.getElementById("audioToggle");

  function syncAudioButton(isPlaying) {
    if (!audioToggle) return;
    audioToggle.classList.toggle("is-playing", isPlaying);
    audioToggle.setAttribute("aria-pressed", String(isPlaying));
    audioToggle.setAttribute("aria-label", isPlaying ? "Apagar música" : "Encender música");
    var label = audioToggle.querySelector(".audio-label");
    if (label) label.textContent = isPlaying ? "Pausar" : "Música";
  }

  if (invitationAudio && audioToggle) {
    invitationAudio.volume = 0.55;

    function removeAutoplayFallback() {
      document.removeEventListener("pointerdown", startAudioFromFirstInteraction, true);
      document.removeEventListener("keydown", startAudioFromFirstInteraction, true);
    }

    async function startInvitationAudio() {
      if (!invitationAudio.paused) {
        removeAutoplayFallback();
        return;
      }

      try {
        await invitationAudio.play();
        removeAutoplayFallback();
      } catch (_error) {
        syncAudioButton(false);
      }
    }

    function startAudioFromFirstInteraction(event) {
      if (event.target.closest && event.target.closest("#audioToggle")) return;
      startInvitationAudio();
    }

    document.addEventListener("pointerdown", startAudioFromFirstInteraction, true);
    document.addEventListener("keydown", startAudioFromFirstInteraction, true);

    audioToggle.addEventListener("click", async function () {
      if (invitationAudio.paused) {
        await startInvitationAudio();
      } else {
        invitationAudio.pause();
      }
    });
    invitationAudio.addEventListener("play", function () { syncAudioButton(true); });
    invitationAudio.addEventListener("pause", function () { syncAudioButton(false); });
    invitationAudio.addEventListener("ended", function () { syncAudioButton(false); });

    startInvitationAudio();
  }

  var modal = document.getElementById("giftModal");
  var openGift = document.getElementById("openGift");
  var previousFocus = null;

  function openModal() {
    previousFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector(".modal-close").focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (previousFocus) previousFocus.focus();
  }

  if (openGift && modal) {
    openGift.addEventListener("click", openModal);
    modal.querySelectorAll("[data-close-modal]").forEach(function (button) {
      button.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  var copyButton = document.getElementById("copyAlias");
  var copyStatus = document.getElementById("copyStatus");

  if (copyButton) {
    copyButton.addEventListener("click", async function () {
      var alias = document.getElementById("giftAlias").textContent.trim();
      try {
        await navigator.clipboard.writeText(alias);
        copyStatus.textContent = "Alias copiado";
        copyButton.textContent = "¡Copiado!";
      } catch (_error) {
        copyStatus.textContent = "Alias: " + alias;
      }
      window.setTimeout(function () {
        copyButton.textContent = "Copiar alias";
        copyStatus.textContent = "";
      }, 2500);
    });
  }
})();
