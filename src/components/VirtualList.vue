<script  setup>
import { computed, reactive, ref, onMounted, onUpdated, nextTick } from 'vue'
const content = ref(null)
const listContainer = ref(null)
const listContent = ref(null)
const items = ref(null)

const props = defineProps({
    //所有列表数据
    listData: {
        type: Array,
        default: () => []
    },
    //预估高度
    estimatedItemSize: {
        type: Number,
        default: 100
    },
    //缓冲区比例
    bufferScale: {
        type: Number,
        default: 1
    }
})
// 定义数据
const state = reactive({
    //可视区域高度
    screenHeight: 0,
    // 起始索引  默认:0  当前视口第一个数据在allData数组的索引位置
    start: 0,
    positions: null,
    allData: [], // 全部数据
    startOffset: 0, // 内容容器的y轴偏移量。当渲染区域第一个元素完全移到了可视区域之外时，重新计算startOffset，将第一个元素移回可视区域
    pillarDomHeight: 0 // 用于撑开滚动容器的高度,allData最后一个元素的endPos值
})

let positionDataArr = [] // 用非响应式数据存储数据的高度和位置
// 处理传过来的数据 , 按照预估高度设置元素位置
// 将数据和dom元素的位置高度信息区分开，避免频繁的响应式数据操作导致卡顿
const initMergeData = () => {
    props.listData.forEach((item, index) => {
        state.allData.push({
            // 数据
            ...item,
            // 当前数据处在allData数组的索引位置
            arrPos: index
        })

        positionDataArr.push({
            // 当前数据处在allData数组的索引位置
            arrPos: index,
            // 当前数据dom的top位置
            startPos: index * props.estimatedItemSize,
            // 当前数据dom的bottom位置
            endPos: (index + 1) * props.estimatedItemSize,
            // 当前数据dom的高度(初始值为猜测高度【预估高度】)
            height: props.estimatedItemSize
        })
    })
}

onMounted(() => {
    // 数据初始化
    initMergeData()
})

// 当前视口高度
const scrollerContainerRefHeight = computed(() => {
    return listContainer.value ? listContainer.value.offsetHeight : 0
})

//结束索引  当前视口最后一个数据在allData数组的索引位置
const end = computed(() => {
    if (!state.allData || state.allData.length <= 0) return 0

    const tmpAllData = positionDataArr
    // 将start作为遍历positionDataArr的开始位置
    let endPos = state.start
    // contentDomTotalHeight存放从start位置开始的dom节点总高度
    let contentDomTotalHeight = tmpAllData[endPos].height
    // 获取视口高度
    const viewPortHeight = scrollerContainerRefHeight.value
    // 从start位置开始遍历positionDataArr的同时，统计数据dom节点的累计高度，直至累计高度超过了视口高度
    while (contentDomTotalHeight < viewPortHeight) {
        endPos++
        contentDomTotalHeight += tmpAllData[endPos].height
    }
    // 因为数组的slice方法是包头不包尾的所以还需要endPos+1，
    // 因为存在在某个元素位置开区间滚动的情况，此时该元素不会完全移出视口，onUpdated不会触发，但又使得视口多出了位置，因此要再+1，渲染下一个元素来占满视口区域
    return endPos + 2
})

const styleTranslate = computed(() => {
    return `transform:translate(0,${state.startOffset}px)`
})

// 当前视口需要显示的数据
const renderData = computed(() => {
    // 避免最后一个元素的数组下标超出实际的数组长度
    const realEnd = Math.min(end.value, state.allData.length)
    return state.allData.slice(state.start, realEnd)
})

// 列表滚动触发
const onScroll = (evt) => {
    const scrollerContainerDom = evt.target
    if (!scrollerContainerDom) return

    const { scrollTop } = scrollerContainerDom // 首条数据的顶部与视口顶端之间的距离

    let idx = 0
    const dataList = positionDataArr
    let dataItem = dataList[idx]
    while (dataItem.endPos <= scrollTop) {
        idx++
        dataItem = dataList[idx]
    }
    state.start = idx
    state.startOffset = positionDataArr[state.start].startPos
}

const updateHeightAndPos = () => {
    // 获取列表的DOM对象
    const contentListDom = listContent.value
    if (!contentListDom) return

    //  获取子元素
    const childrenElementArr = contentListDom.children

    const dataList = positionDataArr
    for (let i = 0; i < childrenElementArr.length; i++) {
        const childEle = childrenElementArr[i]
        // 获取当前数据dom节点的数据在positionDataArr数组中的索引位置
        const dataIndexStr = childEle.dataset['index']

        if (!dataIndexStr) continue

        const dataIndex = parseInt(dataIndexStr)
        // 从positionDataArr数据中获取到该数据
        const dataItem = dataList[dataIndex]
        if (!dataItem) continue

        // 获取元素的实际高度
        const { height } = childEle.getBoundingClientRect()

        const oldHeight = dataItem.height

        /*
            计算当前数据dom元素的旧高度和当前高度的差值

            如：
            oldHeight为100px，height为50px, 那么dffVal为 50px，那么 oldHeight - dffVal 为 50px
            oldHeight为50px，height为100px, 那么dffVal为 -50px，那么 oldHeight - dffVal 为 100px
     */
        const dffVal = oldHeight - height
        if (dffVal != 0) {
            // 当前dom元素的实际高度与allData中记录的高度不一致，则更新高度以及元素位置信息
            dataItem.height = oldHeight - dffVal
            dataItem.endPos = dataItem.endPos - dffVal

            for (let j = dataIndex + 1; j < dataList.length; j++) {
                const jPosDataItem = dataList[j]
                // j位置的上一个位置的元素
                const jPrevPosDataItem = dataList[j - 1]

                jPosDataItem.startPos = jPrevPosDataItem.endPos
                jPosDataItem.endPos =
                    jPosDataItem.startPos + jPosDataItem.height
            }
        }
    }
    state.pillarDomHeight =
        positionDataArr.length > 0
            ? positionDataArr[positionDataArr.length - 1].endPos
            : 0
}

// DOM更新完毕，重新计算列表元素的位置和高度
onUpdated(() => {
    nextTick(() => {
        updateHeightAndPos()
    })
})
</script>
<template>
    <div>
        <div ref="listContainer" class="list-container" @scroll="onScroll">
            <!-- 用于显示滚动条 -->
            <div
                class="pillarDom"
                :style="{ height: `${state.pillarDomHeight}px` }"
            ></div>
            <!-- 数据列表 -->
            <div ref="listContent" class="list-content" :style="styleTranslate">
                <div
                    v-for="item in renderData"
                    :key="item.id"
                    :data-index="item.arrPos"
                    class="list-item"
                >
                    <!-- 通过插槽，自定义列表显示内容 -->
                    <slot :record="item"></slot>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.list-container {
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    position: relative;
    /* 控制元素在移动设备上面是否有滚动回弹效果，属性为auto、touch
    
    auto: 使用普通滚动, 当手指从触摸屏上移开，滚动会立即停止。
    touch: 使用具有回弹效果的滚动,
        当手指从触摸屏上移开，内容会继续保持一段时间的滚动效果。
        继续滚动的速度和持续的时间和滚动手势的强烈程度成正比。
        
    */
    -webkit-overflow-scrolling: touch;
}

.pillarDom {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.list-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
.list-item {
    box-sizing: border-box;
    width: 100%;
}
</style>