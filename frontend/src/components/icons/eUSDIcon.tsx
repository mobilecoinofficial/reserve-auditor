import React from 'react'

export const eUSDIcon = (color?: string, pxSize?: number) => {
  if (!color) {
    color = '#027cfd'
  }
  if (!pxSize) {
    pxSize = 48
  }
  return (
    <svg
      width={pxSize}
      height={pxSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M59 32C59 46.9117 46.9117 59 32 59C17.0883 59 5 46.9117 5 32C5 17.0883 17.0883 5 32 5C46.9117 5 59 17.0883 59 32ZM64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32ZM34.5 13.2938L34.5 9.5H29.5V13.1837C29.1252 13.2465 28.7523 13.3253 28.3824 13.4202C26.1323 13.9974 24.0703 15.1497 22.3958 16.7635C20.7213 18.3772 19.4911 20.3976 18.8225 22.6279C18.154 24.8581 18.0694 27.2239 18.5768 29.4965C19.0842 31.7691 20.1667 33.8728 21.7211 35.603C23.0789 37.1145 24.7567 38.2963 26.6274 39.0633C26.682 39.2877 26.754 39.5085 26.8432 39.7236C27.1842 40.546 27.7615 41.2488 28.502 41.743C29.2426 42.2372 30.1131 42.5007 31.0034 42.5C32.1954 42.4982 33.3381 42.0239 34.181 41.181C35.0239 40.3381 35.4982 39.1954 35.5 38.0034C35.5007 37.1131 35.2372 36.2426 34.743 35.502C34.2488 34.7615 33.546 34.1842 32.7236 33.8432C31.9012 33.5022 30.9961 33.4128 30.1229 33.5863C29.4798 33.7141 28.8752 33.9803 28.3498 34.3632C27.246 33.8814 26.2532 33.1661 25.4406 32.2616C24.4615 31.1717 23.7775 29.8441 23.4567 28.407C23.1358 26.9698 23.1893 25.4734 23.612 24.0635C24.0346 22.6537 24.8114 21.3795 25.8654 20.3637C26.9193 19.348 28.2145 18.6251 29.6248 18.2633C31.035 17.9016 32.514 17.9127 33.9187 18.2958C35.3235 18.6789 36.6079 19.4213 37.6466 20.4529C38.6855 21.4845 39.4433 22.7704 39.8448 24.1866L44.6552 22.8226C44.02 20.5825 42.82 18.5439 41.1699 16.9051C39.5197 15.2663 37.4753 14.0831 35.2341 13.4719C34.9907 13.4055 34.7459 13.3462 34.5 13.2938ZM31.5 31.25C30.5111 31.25 29.5444 30.9568 28.7222 30.4073C27.8999 29.8579 27.259 29.077 26.8806 28.1634C26.5022 27.2498 26.4032 26.2445 26.5961 25.2746C26.789 24.3046 27.2652 23.4137 27.9645 22.7145C28.6637 22.0152 29.5546 21.539 30.5246 21.3461C31.4945 21.1532 32.4998 21.2522 33.4134 21.6306C34.327 22.009 35.1079 22.6499 35.6573 23.4722C36.001 23.9864 36.2444 24.5572 36.3785 25.1546C37.6534 25.6792 38.8462 26.3917 39.9127 27.2733C41.7117 28.7604 43.0917 30.6796 43.91 32.8499C44.7284 35.0207 44.9543 37.363 44.5635 39.647C44.1727 41.9306 43.1802 44.0701 41.6906 45.8597C40.2014 47.6487 38.2671 49.0266 36.0805 49.8681C35.4024 50.129 34.7066 50.3359 34 50.4879V54.5H29V50.6532C26.7462 50.3224 24.6067 49.4485 22.7793 48.1036C20.898 46.7192 19.4091 44.8807 18.4659 42.7605L23.0341 40.7281C23.6189 42.0425 24.549 43.198 25.7428 44.0766C26.9371 44.9555 28.3528 45.5254 29.8535 45.7239C31.3544 45.9225 32.8815 45.7417 34.2847 45.2017C35.6875 44.6618 36.9131 43.7837 37.8476 42.6609C38.7818 41.5387 39.3946 40.2094 39.6351 38.8037C39.8756 37.3983 39.7374 35.9558 39.2314 34.6137C38.7252 33.271 37.8656 32.0682 36.7271 31.1271C36.1591 30.6576 35.5317 30.2616 34.861 29.9477C33.9434 30.782 32.7459 31.2481 31.5 31.25Z"
        fill={color}
      />
    </svg>
  )
}
