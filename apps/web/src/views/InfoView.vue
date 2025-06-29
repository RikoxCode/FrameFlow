<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

const mediaFiles = ref([]);
const liveFeedUrl = ref('');
const errorMessage = ref('');
const statistics = ref({
  totalFiles: 0,
  totalSize: 0,
  currentIndex: 0,
  currentFile: ''
});

const countdown = ref(10);
let socket;
let countdownInterval;

const overlayVisible = ref(false);
const currentIndex = ref(0);

onMounted(() => {
  socket = io('http://localhost:3040');

  socket.on('statistics', (data) => {
    if (data?.error) {
      errorMessage.value = data.error;
      statistics.value = {
        totalFiles: 0,
        totalSize: 0,
        currentIndex: 0,
        currentFile: ''
      };
    } else {
      errorMessage.value = '';

      // Calculate total size in a human-readable format
      if (data.totalSize) {
        const sizeInMB = (data.totalSize / (1024 * 1024)).toFixed(2);
        data.totalSize = `${sizeInMB} MB`;
      }

      statistics.value = {
        totalFiles: data.totalFiles || 0,
        totalSize: data.totalSize || 0,
        currentIndex: data.currentIndex || 0,
        currentFile: data.currentFile || ''
      };

      console.log('Aktuelle Statistik:', statistics.value);
    }
  });

  socket.on('diashow', (data) => {
    if (data?.error) {
      errorMessage.value = data.error;
      liveFeedUrl.value = '';
    } else {
      errorMessage.value = '';
      liveFeedUrl.value = data.src;
      resetCountdown();
    }
  });

  socket.on('mediaFiles', (data) => {
    if (data?.error) {
      errorMessage.value = data.error;
      mediaFiles.value = [];
    } else if (!data || data.length === 0) {
      errorMessage.value = 'Keine Medien gefunden.';
      mediaFiles.value = [];
    } else {
      errorMessage.value = '';
      mediaFiles.value = data;
    }
  });
});

onUnmounted(() => {
  if (socket) socket.disconnect();
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

function openOverlay(index) {
  currentIndex.value = index;
  overlayVisible.value = true;
}

function closeOverlay() {
  overlayVisible.value = false;
}

function prevImage() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

function nextImage() {
  if (currentIndex.value < mediaFiles.value.length - 1) {
    currentIndex.value++;
  }
}

function canNextImage() {
  return currentIndex.value < mediaFiles.value.length - 1;
}

function canPrevImage() {
  return currentIndex.value > 0;
}
</script>

<template>
  <div class="min-h-screen p-6 flex flex-col items-center space-y-8">

    <div class="bg-gray-200 border border-gray-700 p-6 rounded-lg shadow-lg w-full max-w-3xl text-center dark:bg-gray-900">
      <h1 class="text-2xl font-bold text-white mb-2">Bilder Galerie</h1>
      <p class="text-white">Hier siehst du alle aktuellen Bilder. Die Ansicht aktualisiert sich live.</p>

      <div class="w-full flex gap-4 justify-center mt-4">
        <div>
          <p class="text-gray-200" >Anzahl Bilder</p>
          <span class="text-xl font-bold text-gray-300">{{ statistics.totalFiles }}</span>
        </div>
        <div>
          <p class="text-gray-200" >Gesammt Grösse</p>
          <span class="text-xl font-bold text-gray-300">{{ statistics.totalSize }}</span>
        </div>
      </div>

      <p class="text-gray-400 mt-4">Nächstes Bild in {{ countdown }} Sekunden</p>
      <div class="w-full flex justify-center items-center">
        <img
          :src="liveFeedUrl"
          alt="Live Feed"
          class="max-w-full max-h-48 object-contain rounded-lg shadow-md"
          draggable="false"
          @contextmenu.prevent
        />
      </div>
    </div>

    <div v-if="errorMessage" class="text-red-500 text-xl text-center">
      {{ errorMessage }}
    </div>

    <div v-else-if="mediaFiles.length > 0" class="mx-12 flex flex-wrap justify-center gap-4 md:mx-16 lg:mx-20 overflow-scroll">
      <div
        v-for="(file, index) in mediaFiles"
        :key="index"
        @contextmenu.prevent
      >
        <img
          :src="file.src"
          alt="Bild"
          class="max-w-full max-h-20 md:max-h-32 lg:max-h-48 object-contain cursor-pointer select-none"
          draggable="false"
          @contextmenu.prevent
          @click="openOverlay(index)"
        />
      </div>
    </div>

    <div v-else class="text-white text-xl">
      Warte auf Bilddaten…
    </div>

    <!-- Overlay -->
    <div
      v-if="overlayVisible"
      class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex justify-center items-center z-50"
      @click.self="closeOverlay"
    >
      <button
        class="absolute left-5 top-1/2 transform -translate-y-1/2 text-white text-4xl cursor-pointer opacity-50 hover:opacity-100 scale-250"
        :disabled="!canPrevImage()"
        :class="{'cursor-not-allowed': !canPrevImage()}"
        @click.stop="prevImage"
      >
        &#8249;
      </button>

      <img
        :src="mediaFiles[currentIndex].src"
        alt="Bild"
        class="max-h-full object-contain cursor-pointer select-none"
        draggable="false"
        @contextmenu.prevent
      />

      <button
        class="absolute right-5 top-1/2 transform -translate-y-1/2 text-white text-4xl cursor-pointer opacity-50 hover:opacity-100 scale-250"
        :disabled="!canNextImage()"
        :class="{'cursor-not-allowed': !canNextImage()}"
        @click.stop="nextImage"
      >
        &#8250;
      </button>
    </div>

  </div>
</template>
