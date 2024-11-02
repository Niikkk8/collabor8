import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <section className="bg-dark-900">
            <div className="py-8 px-4 mx-auto h-screen flex items-center max-w-screen-xl">
                <div className="mx-auto max-w-screen-sm text-center">
                    <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">404</h1>
                    <p className="mb-4 text-3xl tracking-tight font-bold text-white-500 md:text-4xl dark:text-white">This page's functionality is under progress.</p>
                    {/* <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">This page's functionality is under progrress</p> */}
                    <Link href="/" className="inline-flex text-white bg-brand-500 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4">Back to Homepage</Link>
                </div>
            </div>
        </section>
    )
}
