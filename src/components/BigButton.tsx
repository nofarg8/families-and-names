import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  icon?: IconName
  children: ReactNode
}

export function BigButton({ variant = 'primary', icon, children, className = '', ...rest }: Props) {
  return (
    <button type="button" className={`btn btn-${variant} ${className}`} {...rest}>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </button>
  )
}
