#!/bin/bash

case "${MC_NETWORK}" in
    main|test|main-stage|test-stage)
        exec nginx -c "/etc/nginx/${MC_NETWORK}.nginx.conf" -g "daemon off;"
    ;;
    *)
        exec "$@"
    ;;
esac

