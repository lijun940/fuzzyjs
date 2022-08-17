import type { VNode } from 'vue'
import type { CreateFuzzyOptions, Renderer, RequestCallback, Templates } from '../../types'
import { mapTemplatesRenderer } from '../../utils'
import type { DataProvider } from './createDataProvide'

export function createFilter(renderer: Renderer, templates: Templates[], feature: any, requestCallback: RequestCallback, dataProvide: DataProvider, fuzzyOptions: CreateFuzzyOptions): { Filter: any; FilterButton: VNode } {
  const FilterFrom = renderer.form.create({
    templates: mapTemplatesRenderer(templates, 'filter'),
    feature,
    isHorizontal: true,
    shouldWarpEvenly: false,
    shouldValidate: false,
  })

  // invoke requestCallback to get filter data
  async function dispatchFilter() {
    dataProvide.dispatch.setTableLoading(true)
    const {
      success,
      data,
      message,
      total,
    } = await requestCallback.get({ ...FilterFrom.model })
    // success
    dataProvide.dispatch.setTableLoading(false)
    if (success) {
      dataProvide.dispatch.setTableData(data)
      dataProvide.dispatch.setTotal(total)
      return
    }
    // failed
    renderer.message.warning(message)
  }

  function FilterButton() {
    return (
      <renderer.button.render
        type="primary"
        onClick={dispatchFilter}>{
          fuzzyOptions.lang?.filter || '查询'
        }</renderer.button.render>
    )
  }

  // 首次加载
  Promise.resolve().then(dispatchFilter)

  return {
    Filter: <FilterFrom.render/>,
    FilterButton: <FilterButton/>,
  }
}
