<template>
    <p>
        <span style="color: red">{{ item.id }}</span
        >{{ item.value }}
    </p>
</template>


<script>
export default {
    props: {
        item: {
            type: Object,
            default: () => {}
        }
    },

    mounted() {},
    updated() {},
    data() {
        return {}
    },
    methods: {}
}
</script>


<style scoped>
</style>