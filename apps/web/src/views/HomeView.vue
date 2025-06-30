<script setup>
import Icon from "@/components/Icon.vue";
import {ref} from 'vue';
import 'animate.css';
import Router from "@/router/index.js";

const fileInput = ref(null);
const filename = ref('');
const isUploaded = ref(false);
const url = 'http://localhost:3000/api/dropbox/upload';
const loading = ref(false);

const handleFileChange = (event) => {
  isUploaded.value = false;
  const file = event.target.files[0];
  if (file) {
    filename.value = file.name;
    isUploaded.value = true;
  }
};

const sendFile = async () => {
  if (!fileInput.value.files.length) {
    alert('Bitte wählen Sie ein Bild aus.');
    return;
  }

  loading.value = true;

  const formData = new FormData();
  formData.append('file', fileInput.value.files[0]);

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    loading.value = false;
    await Router.push('/success');
  }
};
</script>

<template>
  <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md dark:bg-gray-800">
    <h1 class="text-2xl font-semibold text-center text-gray-800 mb-6 dark:text-slate-200">Lade ein
      Bild hoch</h1>

    <form @submit.prevent="sendFile" enctype="multipart/form-data" class="space-y-4">
      <!-- File Input -->
      <div
        class="w-full py-9 bg-gray-50 rounded-2xl border border-gray-300 gap-3 grid border-dashed relative dark:bg-gray-600 dark:border-gray-700">
        <label>
          <div class="grid gap-1">
            <Icon v-if="isUploaded" icon="description"
                  class="text-4xl text-gray-400 text-center animate__animated animate__fadeInUp animate__faster"/>
            <h2 v-if="!isUploaded" class="text-center text-gray-400 text-xs leading-4 mb-4">PNG, JPG
              oder PDF, kleiner als 15MB</h2>
          </div>
          <div class="grid gap-2">
            <p :class="{'animate__animated animate__fadeIn': isUploaded, 'hidden':!isUploaded}"
               id="filename" class="my-2 text-center text-gray-400 text-md leading-4">{{
                filename
              }}</p>
            <div class="flex items-center justify-center">
              <input ref="fileInput" type="file" name="imageData" hidden
                     @change="handleFileChange"/>
              <div
                class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full text-sm cursor-pointer">
                {{ isUploaded ? 'Datei wechseln' : 'Datei auswählen' }}
              </div>
            </div>
          </div>
        </label>
      </div>
      <!-- Submit Button -->
      <button type="submit"
              class="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2">
        <p>Hochladen</p>
      </button>
      <div class="flex justify-center">
        <p class="text-md font-semibold text-center text-gray-800 mb-6 dark:text-gray-400">Hier lang
          zur <a class="text-blue-500 hover:underline" href="/info">Info Seite</a></p>
      </div>
    </form>
  </div>

  <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-500/50 z-50">
    <div role="status">
      <svg aria-hidden="true"
           class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
           viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"/>
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"/>
      </svg>
    </div>
  </div>
</template>
