FROM openpolicyagent/opa:0.29.4
ADD ./bundle /opt/opa/bundle/
# ENTRYPOINT [ "/bin/bash" ]
CMD ["run", "--server" ,"-b" ,"/opt/opa/bundle"]