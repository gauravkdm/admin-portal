import Image from "next/image"
import { format } from "date-fns"
import {
  Calendar,
  CheckCircle,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
  XCircle,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface UserProfileProps {
  user: {
    Id: string
    FirstName: string | null
    LastName: string | null
    Email: string | null
    PhoneNo: string | null
    CountryCode: string | null
    Gender: string | null
    Dob: string | null
    Bio: string | null
    Occupation: string | null
    Education: string | null
    IsVerified: boolean
    IsEmailVerified: boolean
    IsPhoneVerified: boolean
    ProfilePhotoCdnUrl1: string | null
    ProfilePhotoCdnUrl2: string | null
    ProfilePhotoCdnUrl3: string | null
    ProfilePhotoCdnUrl4: string | null
    ProfilePhotoCdnUrl5: string | null
    LocationCity: string | null
    LocationCountry: string | null
    ZodiacSign: string | null
    SmokingHabit: string | null
    DrinkingHabit: string | null
    CreatedAt: Date | null
    UpdatedAt: Date | null
    UserHobbies: Array<{ Hobbies: { Name: string | null } }>
    UserInterests: Array<{ Interests: { Name: string | null } }>
    UserLanguages: Array<{ Languages: { Name: string | null } }>
    Timezones: { TimeZone: string | null; DisplayName: string | null } | null
    hostedEventsCount: number
    rsvpCount: number
    matchesCount: number
    purchasedTicketsCount: number
  }
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export function UserProfile({ user }: UserProfileProps) {
  const photos = [
    user.ProfilePhotoCdnUrl1,
    user.ProfilePhotoCdnUrl2,
    user.ProfilePhotoCdnUrl3,
    user.ProfilePhotoCdnUrl4,
    user.ProfilePhotoCdnUrl5,
  ].filter(Boolean)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.ProfilePhotoCdnUrl1 || undefined} />
              <AvatarFallback className="text-2xl">
                {(user.FirstName?.[0] || "?").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                {user.FirstName} {user.LastName}
              </h2>
              {user.Bio && (
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {user.Bio}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {user.IsVerified ? (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="mr-1 h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline">
                  <XCircle className="mr-1 h-3 w-3" /> Unverified
                </Badge>
              )}
            </div>
          </div>

          <Separator orientation="vertical" className="hidden md:block" />

          <div className="flex-1 space-y-3">
            <InfoRow
              icon={Phone}
              label="Phone"
              value={`${user.CountryCode || ""}${user.PhoneNo || ""}`}
            />
            <InfoRow icon={Mail} label="Email" value={user.Email} />
            <InfoRow icon={User} label="Gender" value={user.Gender} />
            <InfoRow icon={Calendar} label="DOB" value={user.Dob} />
            <InfoRow
              icon={MapPin}
              label="Location"
              value={
                [user.LocationCity, user.LocationCountry]
                  .filter(Boolean)
                  .join(", ") || null
              }
            />
            <InfoRow
              icon={Globe}
              label="Timezone"
              value={user.Timezones?.DisplayName}
            />
            <InfoRow icon={User} label="Occupation" value={user.Occupation} />
            <InfoRow icon={User} label="Education" value={user.Education} />
            {user.ZodiacSign && (
              <InfoRow icon={User} label="Zodiac" value={user.ZodiacSign} />
            )}
            {user.SmokingHabit && (
              <InfoRow icon={User} label="Smoking" value={user.SmokingHabit} />
            )}
            {user.DrinkingHabit && (
              <InfoRow
                icon={User}
                label="Drinking"
                value={user.DrinkingHabit}
              />
            )}
            {user.CreatedAt && (
              <InfoRow
                icon={Calendar}
                label="Joined"
                value={format(new Date(user.CreatedAt), "PPP")}
              />
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-semibold">
                  {user.hostedEventsCount}
                </p>
                <p className="text-xs text-muted-foreground">Events Hosted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">{user.rsvpCount}</p>
                <p className="text-xs text-muted-foreground">RSVPs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">{user.matchesCount}</p>
                <p className="text-xs text-muted-foreground">Matches</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">
                  {user.purchasedTicketsCount}
                </p>
                <p className="text-xs text-muted-foreground">Tickets Bought</p>
              </div>
            </div>

            {(user.UserHobbies.length > 0 ||
              user.UserInterests.length > 0 ||
              user.UserLanguages.length > 0) && (
              <>
                <Separator />
                <div className="space-y-2">
                  {user.UserHobbies.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Hobbies
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {user.UserHobbies.map((h, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {h.Hobbies.Name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {user.UserInterests.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Interests
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {user.UserInterests.map((i, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {i.Interests.Name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {user.UserLanguages.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Languages
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {user.UserLanguages.map((l, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {l.Languages.Name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <>
              <Separator orientation="vertical" className="hidden md:block" />
              <div className="grid grid-cols-2 gap-2 w-fit">
                {photos.slice(1).map((url, i) => (
                  <Image
                    key={i}
                    src={url!}
                    alt={`Photo ${i + 2}`}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
