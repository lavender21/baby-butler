<template>
  <van-config-provider :theme-vars="themeVars">
    <router-view />
  </van-config-provider>
</template>

<script setup>
const themeVars = {
  primaryColor: '#4f67ff',
  successColor: '#21b573',
  warningColor: '#f2b843',
  textColor: '#1f2533',
  tabbarItemActiveColor: '#4f67ff',
  navBarTitleTextColor: '#1f2533',
  navBarIconColor: '#1f2533',
  buttonPrimaryBackground: '#4f67ff',
  buttonPrimaryBorderColor: '#4f67ff'
}
</script>
