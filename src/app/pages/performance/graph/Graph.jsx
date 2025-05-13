import React from 'react'
import Linegraph from './Linegraph'
import Pichart from './Pichart'
import Imagegraph from './Imagegraph'
import Barchart from './Barchart'

function Graph() {
  return (
    <div>
        <div className='flex flex-col lg:flex-row justify-between gap-4'>
      <div className="lg:w-2/3 w-full">
          <Imagegraph />
      </div>
      <div className='lg:w-1/3 w-full'>
        <Pichart />
      </div>
        </div>
        <div className='flex flex-col lg:flex-row justify-between gap-4'>
      <div className='lg:w-1/3 w-full'>
      <Linegraph />
      </div>
      <div className="lg:w-3/3 w-full md:mt-10 mt-2">
        <Barchart />
      </div>
        </div>
    </div>
  )
}

export default Graph
