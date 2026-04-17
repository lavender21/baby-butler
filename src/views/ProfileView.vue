<template>
  <div class="page">
    <van-nav-bar title="个人中心" />

    <div class="section-card">
      <div style="font-size: 18px; font-weight: 700">{{ form.name || '宝宝' }}</div>
      <div class="value-sub" style="margin-top: 4px">{{ store.ageText }}</div>
    </div>

    <div class="section-card">
      <van-form @submit="onSubmit">
        <van-field v-model="form.name" label="宝宝昵称" placeholder="请输入宝宝昵称" required />
        <van-field
          v-model="form.birthday"
          is-link
          readonly
          label="出生日期"
          placeholder="请选择出生日期"
          @click="showDate = true"
        />
        <van-field v-model="form.gender" label="宝宝性别" placeholder="男宝 / 女宝" />
        <div style="margin-top: 16px">
          <van-button type="primary" native-type="submit" block>保存信息</van-button>
        </div>
      </van-form>
    </div>

    <van-popup v-model:show="showDate" position="bottom">
      <van-date-picker
        :model-value="datePickerValue"
        title="选择生日"
        @cancel="showDate = false"
        @confirm="onConfirmDate"
      />
    </van-popup>
  </div>

  <AppTabbar />
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onMounted, reactive, ref } from 'vue'
import { showSuccessToast } from 'vant'
import AppTabbar from '../components/AppTabbar.vue'
import { useSleepStore } from '../stores/sleep'
import type { BabyProfile } from '../types/sleep'

const store = useSleepStore()
const showDate = ref(false)
const form = reactive<BabyProfile>({
  name: '',
  birthday: '',
  gender: '',
  avatarUrl: ''
})

const datePickerValue = computed(() => {
  const date = form.birthday ? dayjs(form.birthday) : dayjs()
  return [date.format('YYYY'), date.format('MM'), date.format('DD')]
})

function onConfirmDate({ selectedValues }: { selectedValues: string[] }) {
  form.birthday = `${selectedValues[0]}-${selectedValues[1]}-${selectedValues[2]}`
  showDate.value = false
}

async function onSubmit() {
  await store.saveProfile({ ...form })
  showSuccessToast('保存成功')
}

onMounted(async () => {
  if (!store.profile.name) {
    await store.loadAll()
  }

  form.name = store.profile.name
  form.birthday = store.profile.birthday
  form.gender = store.profile.gender
  form.avatarUrl = store.profile.avatarUrl || ''
})
</script>
