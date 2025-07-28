// const snapPath = (i: number, j: number, name?: string) =>
//   `./__snapshots__/${i}-${j}${name ? '-' + name : ''}.json`

describe('example test', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(1704060000000))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should pass', () => {
    expect(true).toEqual(true)
  })
})
