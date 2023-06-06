import type { PropType } from 'vue'
import { computed, defineComponent, getCurrentInstance, watch } from 'vue'
import type {
  CreateFuzzyOptions,
  ExtraRenderer,
  FuzzyNextHandlers,
  LayoutProvider,
  Mock,
  ModalRenderer,
  OptionsConfiguration, PagingProvider,
  Renderer,
  RequestProvider,
} from '../../../types'
import { LiftOff } from './core'
import { useActivated, useSlotsMap, workInProgressFuzzy } from './extend'

export function createComponent(globalRenderer: Renderer, globalLayoutProvider: LayoutProvider, requestProvider: RequestProvider, globalPaging: PagingProvider, fuzzyOptions: CreateFuzzyOptions) {
  return defineComponent({
    props: {
      options: {
        type: Object as (PropType<OptionsConfiguration>),
        default: () => ({ template: [] }),
        required: true,
      },
      renderer: {
        type: Object as (PropType<Renderer>),
        default: () => globalRenderer,
      },
      layoutProvider: {
        type: Object as (PropType<any>),
        default: () => globalLayoutProvider,
      },
      modalRenderer: {
        type: Object as (PropType<ModalRenderer>),
        default: () => ({}),
      },
      extraRenderer: {
        type: Array as (PropType<ExtraRenderer>),
        default: () => ([]),
      },
      handlers: {
        type: Object as (PropType<FuzzyNextHandlers>),
        default: () => ({}),
      },
      mock: {
        type: Object as (PropType<Mock>),
        default: () => ({ data: [], total: 0 }),
      },
      paging: {
        type: Object as PropType<PagingProvider>,
        default: () => globalPaging,
      },
    },
    setup(props, { slots }) {
      // 提供给用户的强制更新
      workInProgressFuzzy.forceUpdate = getCurrentInstance()?.proxy?.$forceUpdate

      // 当前被激活的配置
      const activated = useActivated(computed(() => props))

      // 注入插槽组件
      const injectSlotCompProps = useSlotsMap(slots)

      watch(() => activated.tab.value,
        () => {
          if (activated.handlers.value && activated.handlers.value.tabChange)
            activated.handlers.value.tabChange()
        })

      // 根据activeOptions页面配置动态渲染
      const dynamicLayout = computed(() => {
        const components = LiftOff(
          props.renderer, activated.modalRenderer.value,
          activated.extraRenderer.value, activated.handlers.value,
          activated.options.value, props.mock, requestProvider,
          fuzzyOptions, props.paging,
        )

        // 为插槽组件注入props
        const slotsMap = injectSlotCompProps({ options: activated.options.value })

        return (
          <activated.layoutProvider.value
            renderer={{ ...components, Tab: activated.tab.value }}
            {...slotsMap}
          ></activated.layoutProvider.value>
        )
      })

      return () => (
        <>
          {
            dynamicLayout.value
          }
        </>
      )
    },
  })
}
