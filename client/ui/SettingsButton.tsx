import Image from "next/image"

export default function SettingsButton() {
  return (
    <div>
        <Image
        src="cog.svg"
        alt={"settings"}
        className="px-5;"
        width={20}
        height={20}
        padding-right={20}
    />
    </div>
  )
}
