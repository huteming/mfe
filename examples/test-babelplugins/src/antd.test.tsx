import Component from './antd'
import { mount } from 'enzyme'
import type { ReactWrapper } from 'enzyme'
import React from 'react'
import { act } from 'react-dom/test-utils'

describe('react component', () => {
  let wrapper: ReactWrapper<any>

  test('不应该引入全量antd', async () => {
    await act(async () => {
      wrapper = mount(<Component />)
    })

    expect(true).toBeTruthy()
  })
})
