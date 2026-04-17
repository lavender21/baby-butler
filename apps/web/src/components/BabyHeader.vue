<template>
  <header class="baby-header" :class="{ 'baby-header--has-title': !!title }">
    <div class="baby-header__row">
      <button v-if="showBack" class="baby-header__back" type="button" @click="emit('back')">
        <van-icon name="arrow-left" size="18" />
      </button>

      <div class="baby-header__info">
        <div class="baby-header__avatar">
          <img
            v-if="avatarUrl && !avatarBroken"
            class="baby-header__avatar-img"
            :src="avatarUrl"
            :alt="`${store.profile.name || '宝宝'}头像`"
            @error="avatarBroken = true"
          />
          <span v-else class="baby-header__avatar-text" aria-hidden="true">{{ avatarText }}</span>
        </div>
        <div>
          <div class="baby-header__name">{{ store.profile.name || '宝宝' }}</div>
          <div class="value-sub baby-header__age">{{ store.ageText }}</div>
        </div>
      </div>
    </div>

    <div v-if="title" class="baby-header__title">{{ title }}</div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useSleepStore } from '../stores/sleep'

defineProps<{
  title?: string
  showBack?: boolean
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const store = useSleepStore()
const avatarBroken = ref(false)

const avatarUrl = computed(() => (store.profile.avatarUrl || '').trim())

const avatarText = computed(() => {
  const name = (store.profile.name || '').trim()
  return (name ? name.slice(0, 1) : '宝').toUpperCase()
})

watch(
  avatarUrl,
  () => {
    avatarBroken.value = false
  },
  { immediate: true }
)

onMounted(async () => {
  if (!store.profile.name) {
    await store.loadAll()
  }
})
</script>

<style scoped>
.baby-header {
  position: sticky;
  top: 0;
  z-index: 10;

  margin: -12px -12px 12px;
  padding: calc(10px + env(safe-area-inset-top)) 12px 10px;

  background: #fff;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(72, 98, 190, 0.08);
}

.baby-header__row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.baby-header__info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.baby-header__avatar {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(72, 98, 190, 0.18), rgba(72, 98, 190, 0.06));
  border: 1px solid rgba(72, 98, 190, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(72, 98, 190, 0.12);
  flex: none;
  overflow: hidden;
}

.baby-header__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.baby-header__avatar-text {
  font-size: 16px;
  font-weight: 800;
  color: rgba(31, 37, 51, 0.9);
}

.baby-header__back {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 3px 12px rgba(72, 98, 190, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #1f2533;
}

.baby-header__name {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.baby-header__age {
  flex: none;
  white-space: nowrap;
}

.baby-header__title {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2533;
}
</style>
