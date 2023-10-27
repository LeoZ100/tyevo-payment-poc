import React from 'react'
import {Circles} from 'react-loader-spinner'

export const LoadingComponent = () => {
    return (
        <div className="fixed inset-0 flex justify-center items-center">
            <Circles
                height="80"
                width="80"
                color="#33ccff"
                ariaLabel="circles-loading"
                visible={true}
            />
        </div>
    )
}
