<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

const imageUrl = ref('');
const errorMessage = ref('');
const countdown = ref(10);
let socket;
let countdownInterval;

onMounted(() => {
  socket = io('http://localhost:3000');

  socket.on('diashow', (data) => {
    if (data?.error) {
      errorMessage.value = data.error;
      imageUrl.value = '';
    } else {
      errorMessage.value = '';
      imageUrl.value = data.src;
      resetCountdown();
    }
  });
});

onUnmounted(() => {
  if (socket) socket.disconnect();
  if (countdownInterval) clearInterval(countdownInterval);
});

const resetCountdown = () => {
  countdown.value = 10;
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
};
</script>

<template>
  <div class="relative w-screen h-screen bg-black flex items-center justify-center">

    <div v-if="errorMessage" class="text-red-500 text-xl z-10">
      {{ errorMessage }}
    </div>

    <img
      v-else-if="imageUrl"
      :src="imageUrl"
      alt="Bild"
      class="absolute inset-0 w-full h-full object-contain"
    />

    <div v-else class="text-white text-xl z-10">
      Warte auf Bilddaten…
    </div>

    <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-lg bg-black/50 px-4 py-2 rounded-lg z-10">
      Nächstes Bild in {{ countdown }} Sekunden
    </div>
  </div>
</template>
