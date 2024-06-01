import Image from "next/image"

export default function SettingsButton() {
  return (
    <div className="">
        <Image
        src="cog.svg"
        alt={"settings"}
        className="dark:invert px-5;"
        width={20}
        height={20}
        padding-right={20}
    />
    </div>
  )
}
