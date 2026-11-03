<script setup lang="ts">
import { computed, ref, watch } from 'vue'

/**
 * A text field that keeps what the user is typing, shows the rule's message when it is invalid,
 * and only emits `commit` for valid values. (A field bound straight to the store would snap back silently.)
 */
defineOptions({ inheritAttrs: false })
const props = defineProps<{ modelValue: string | number | null | undefined; rule?: (v: string) => true | string }>()
const emit = defineEmits<{ commit: [value: string] }>()

const draft = ref(String(props.modelValue ?? ''))
const focused = ref(false)
watch(() => props.modelValue, v => { if (!focused.value) draft.value = String(v ?? '') })

const problem = computed(() => { const r = props.rule?.(draft.value); return r === undefined || r === true ? [] : [r] })
function onInput(v: string) {
  draft.value = v ?? ''
  if (!props.rule || props.rule(draft.value) === true) emit('commit', draft.value)
}
function onBlur() { focused.value = false; if (!problem.value.length) draft.value = String(props.modelValue ?? '') }
</script>

<template>
  <v-text-field
    v-bind="$attrs" :model-value="draft" :error-messages="problem" density="compact" variant="outlined" hide-details="auto"
    @update:model-value="onInput" @focus="focused = true" @blur="onBlur"
  />
</template>
