import type { PropType } from 'vue'
import { getCurrentInstance } from 'vue'
import type {
  CreateFuzzyOptions,
  ExtraRenderer,
  FuzzyNextHandlers,
  LayoutProvider,
  ModalRenderer,
  OptionsConfiguration, PagingProvider,
  Renderer,
  RequestProvider,
} from '../types'
import { LiftOff } from './lift-off'
import { useActivated } from './useActivated'
import { workInProgressFuzzy } from './expose'
import '../tailwind.css'

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
        type: Array,
        default: () => ([]),
      },
      paging: {
        type: Object as PropType<PagingProvider>,
        default: () => globalPaging,
      },
    },
    setup(props) {
      // 提供给用户的强制更新
      workInProgressFuzzy.forceUpdate = getCurrentInstance()?.proxy?.$forceUpdate

      const {
        modalRenderer,
        extraRenderer,
        options,
        tab,
        layoutProvider,
        handlers,
      } = useActivated(props)

      // 根据activeOptions页面配置动态渲染
      const dynamicLayout = computed(() => {
        if (!props.options) {
          const {
            modalRenderer: _modalRenderer,
            extraRenderer: _extraRenderer,
            options: _options,
            tab: _tab,
            layoutProvider: _layoutProvider,
            handlers: _handlers,
          } = useActivated(props)
          const components = LiftOff(props.renderer, _modalRenderer.value, _extraRenderer.value, _handlers.value, _options.value, props.mock, requestProvider, fuzzyOptions, props.paging)
          return (
            <_layoutProvider.value renderer={{ ...components, Tab: _tab.value }}></_layoutProvider.value>
          )
        }
        else {
          const components = LiftOff(props.renderer, modalRenderer.value, extraRenderer.value, handlers.value, options.value, props.mock, requestProvider, fuzzyOptions, props.paging)
          return (
            <layoutProvider.value renderer={{ ...components, Tab: tab.value }}></layoutProvider.value>
          )
        }
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
