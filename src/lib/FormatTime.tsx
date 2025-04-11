import React from 'react'

interface FormatTimeProps {
  timeInSeconds: number;
}

function FormatTime({ timeInSeconds }: FormatTimeProps) {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  return (
    <React.Fragment>
      <span className="text-yellow-400 font-bold text-lg">
        {`${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}
      </span>
    </React.Fragment>
  )
}

export default FormatTime;